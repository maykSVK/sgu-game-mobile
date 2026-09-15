const fetch = require('node-fetch');
const { CookieJar } = require('tough-cookie');
const fs = require('fs');

const BASE_URL = 'https://www.sgu-game.cz';
let cookieJar = new CookieJar();
let currentUser = null;

const SESSION_FILE = __dirname + '/session.json';
if (fs.existsSync(SESSION_FILE)) {
  try {
    const data = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
    cookieJar = CookieJar.fromJSON(data.jar);
    currentUser = data.user;
  } catch (e) {
    console.error('Nepodarilo sa načítať session.json');
  }
}

function saveSession() {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify({
       user: currentUser,
       jar: cookieJar.toJSON()
    }));
  } catch(e) {}
}

async function getCookiesForUrl(url) {
  return await cookieJar.getCookieString(url);
}

async function fetchWithCookies(url, options = {}) {
  const cookieString = await getCookiesForUrl(url);
  const headers = {
    ...options.headers,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ...(cookieString ? { 'Cookie': cookieString } : {})
  };

  const res = await fetch(url, { ...options, headers });
  
  const setCookies = res.headers.raw()['set-cookie'];
  if (setCookies) {
    for (const cookie of setCookies) {
      await cookieJar.setCookie(cookie, url);
    }
    saveSession();
  }
  return res;
}

async function login(username, password) {
  try {
    const homeRes = await fetchWithCookies(BASE_URL + '/');
    if (!homeRes.ok) return { ok: false, error: 'Chyba pri načítaní úvodnej stránky' };

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('action-login', 'login');

    const loginRes = await fetchWithCookies(BASE_URL + '/index.php', {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': BASE_URL + '/'
      },
      redirect: 'manual'
    });

    if (loginRes.status === 301 || loginRes.status === 302) {
      const location = loginRes.headers.get('location');
      if (location && location.includes('dashboard')) {
        currentUser = username;
        saveSession();
        return { ok: true, username };
      }
    }

    const body = await loginRes.text();
    if (body.includes('Nesprávne heslo') || body.includes('Špatné uživatelské jméno nebo heslo')) {
      return { ok: false, error: 'Nesprávne meno alebo heslo' };
    }
    
    if (body.includes('Odhlásiť') || body.includes('Odhlásit')) {
      currentUser = username;
      saveSession();
      return { ok: true, username };
    }

    return { ok: false, error: 'Prihlásenie zlyhalo' };
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: 'Chyba servera pri prihlasovaní' };
  }
}

async function logout() {
  currentUser = null;
  cookieJar = new CookieJar();
  saveSession();
  return { ok: true };
}

async function fetchPage(path, options = {}) {
  const cookieString = await getCookiesForUrl(BASE_URL);
  if (!cookieString) throw new Error('No session available');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `${BASE_URL}/dashboard.php`,
      ...options.headers
    },
    redirect: options.redirect || 'follow',
  });
  return res.text();
}

async function fetchPageWithUrl(path, options = {}) {
  const cookieString = await getCookiesForUrl(BASE_URL);
  if (!cookieString) throw new Error('No session available');

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `${BASE_URL}/dashboard.php`,
      ...options.headers
    },
    redirect: options.redirect || 'follow',
  });
  return { html: await res.text(), url: res.url };
}

async function postPage(path, data = {}) {
  const cookieString = await getCookiesForUrl(BASE_URL);
  if (!cookieString) throw new Error('No session available');

  const params = new URLSearchParams(data);
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Cookie': cookieString,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `${BASE_URL}/dashboard.php`,
    },
    body: params.toString(),
    redirect: 'manual',
  });

  return {
    status: res.status,
    location: res.headers.get('location'),
    body: await res.text(),
  };
}

function isLoggedIn() { 
  return currentUser !== null;
}
function username() { return currentUser; }

module.exports = { login, logout, fetchPage, fetchPageWithUrl, postPage, isLoggedIn, username };
