/**
 * auth.js – správa session pre sgu-game.cz
 * Ukladá cookies v pamäti, prihlásenie cez form POST.
 */
const fetch = require('node-fetch');
const { CookieJar } = require('tough-cookie');
const { promisify } = require('util');

const BASE_URL = 'https://www.sgu-game.cz';

// In-memory session state
let cookieJar = new CookieJar();
let _username = null;
let _loggedIn = false;

const setCookieAsync = promisify(cookieJar.setCookie.bind(cookieJar));
const getCookieStringAsync = promisify(cookieJar.getCookieString.bind(cookieJar));

/**
 * Prihlási používateľa na sgu-game.cz
 */
async function login(username, password) {
  cookieJar = new CookieJar(); // reset

  // 1. Získaj úvodné cookies (PHPSESSID)
  const res1 = await fetch(`${BASE_URL}/`);
  const setCookieHeaders1 = res1.headers.raw()['set-cookie'] || [];
  for (const cookieStr of setCookieHeaders1) {
    await setCookieAsync(cookieStr, BASE_URL);
  }

  // 2. Odošli formulár so správnymi cookies
  const cookieString = await getCookieStringAsync(BASE_URL);
  const params = new URLSearchParams();
  params.append('username', username);
  params.append('password', password);
  params.append('action-login', 'login'); // Server vyžaduje presne toto tlačidlo

  const res = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (compatible; SGU-Mobile/1.0)',
    },
    body: params.toString(),
    redirect: 'manual',
  });

  // Ulož cookies po prihlásení
  const setCookieHeaders2 = res.headers.raw()['set-cookie'] || [];
  for (const cookieStr of setCookieHeaders2) {
    await setCookieAsync(cookieStr, BASE_URL);
  }

  // Skontroluj redirect – po úspešnom prihlásení server presmeruje na dashboard.php
  const location = res.headers.get('location') || '';
  if (location.includes('dashboard.php') || res.status === 302) {
    const check = await fetchPage('/dashboard.php');
    if (check.includes('dashboard') || check.includes('Řídící místnost')) {
      _username = username;
      _loggedIn = true;
      console.log(`✅ Prihlásený ako: ${username}`);
      return { ok: true, username };
    }
  }

  const bodyText = await res.text();
  const errorMatch = bodyText.match(/<div[^>]*class="[^"]*alert[^"]*"[^>]*>(.*?)<\/div>/i);
  const errorMsg = errorMatch ? errorMatch[1].replace(/<[^>]*>/g, '').trim() : 'Neznáma chyba (pozri log)';
  
  _loggedIn = false;
  console.log(`❌ Prihlásenie zlyhalo (status: ${res.status}, location: ${location})`);
  console.log(`❌ Odpoveď servera (chyba): ${errorMsg}`);
  
  return { ok: false, error: errorMsg };
}

/**
 * Odhlásenie
 */
async function logout() {
  await fetchPage('/logout.php');
  cookieJar = new CookieJar();
  _loggedIn = false;
  _username = null;
  return { ok: true };
}

/**
 * Fetchne stránku zo sgu-game.cz s aktuálnou session
 */
async function fetchPage(path) {
  const cookieString = await getCookieStringAsync(BASE_URL);
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (compatible; SGU-Mobile/1.0)',
      'Referer': `${BASE_URL}/dashboard.php`,
    },
    redirect: 'follow',
  });
  return res.text();
}

/**
 * Pošle POST request na sgu-game.cz (formuláre, AJAX)
 */
async function postPage(path, data = {}) {
  const cookieString = await getCookieStringAsync(BASE_URL);
  const params = new URLSearchParams(data);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Cookie': cookieString,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (compatible; SGU-Mobile/1.0)',
      'Referer': `${BASE_URL}/dashboard.php`,
    },
    body: params.toString(),
    redirect: 'manual',
  });

  // Aktualizuj cookies
  const setCookieHeaders = res.headers.raw()['set-cookie'] || [];
  for (const cookieStr of setCookieHeaders) {
    await setCookieAsync(cookieStr, BASE_URL);
  }

  return {
    status: res.status,
    location: res.headers.get('location'),
    body: await res.text(),
  };
}

function isLoggedIn() { return _loggedIn; }
function username() { return _username; }

module.exports = { login, logout, fetchPage, postPage, isLoggedIn, username };
