const fetch = require('node-fetch');
const { AsyncLocalStorage } = require('async_hooks');

const BASE_URL = 'https://www.sgu-game.cz';
const asyncLocalStorage = new AsyncLocalStorage();

function extractCookies(setCookiesArray) {
  if (!setCookiesArray) return '';
  return setCookiesArray.map(c => c.split(';')[0]).join('; ');
}

async function fetchWithCookies(url, options = {}, incomingCookies = '') {
  const headers = {
    ...options.headers,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ...(incomingCookies ? { 'Cookie': incomingCookies } : {})
  };

  const res = await fetch(url, { ...options, headers });
  
  const setCookies = res.headers.raw()['set-cookie'];
  let newCookies = incomingCookies;
  if (setCookies) {
    const extracted = extractCookies(setCookies);
    newCookies = extracted;
  }
  return { res, cookies: newCookies };
}

async function login(username, password) {
  try {
    const { res: homeRes, cookies: homeCookies } = await fetchWithCookies(BASE_URL + '/');
    if (!homeRes.ok) return { ok: false, error: 'Chyba pri nacítani úvodnej stranky' };

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('action-login', 'login');

    const { res: loginRes, cookies: loginCookies } = await fetchWithCookies(BASE_URL + '/index.php', {
      method: 'POST',
      body: params.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': BASE_URL + '/'
      },
      redirect: 'manual'
    }, homeCookies);

    const finalCookies = loginCookies || homeCookies;

    if (loginRes.status === 301 || loginRes.status === 302) {
      const location = loginRes.headers.get('location');
      if (location && location.includes('dashboard')) {
        return { ok: true, username, token: finalCookies };
      }
    }

    const body = await loginRes.text();
    if (body.includes('Nesprávne heslo') || body.includes('Spatné uzivatelské jméno nebo heslo')) {
      return { ok: false, error: 'Nesprávne meno alebo heslo' };
    }
    
    if (body.includes('Odhlásit')) {
      return { ok: true, username, token: finalCookies };
    }

    return { ok: false, error: 'Prihlásenie zlyhalo' };
  } catch (err) {
    console.error('Login error:', err);
    return { ok: false, error: 'Chyba servera pri prihlasovaní' };
  }
}

async function logout() {
  return { ok: true };
}

function getSessionCookie() {
  const store = asyncLocalStorage.getStore();
  return store ? store.token : null;
}

async function fetchPage(path, options = {}) {
  const cookieString = getSessionCookie();
  if (!cookieString) throw new Error('No session available (401)');

  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': BASE_URL + '/dashboard.php',
      ...options.headers
    },
    redirect: options.redirect || 'follow',
  });
  if (res.url.includes('index.php') && !path.includes('index.php')) {
    throw new Error('No session available (401)');
  }
  return res.text();
}

async function fetchPageWithUrl(path, options = {}) {
  const cookieString = getSessionCookie();
  if (!cookieString) throw new Error('No session available (401)');

  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': BASE_URL + '/dashboard.php',
      ...options.headers
    },
    redirect: options.redirect || 'follow',
  });
  if (res.url.includes('index.php') && !path.includes('index.php')) {
    throw new Error('No session available (401)');
  }
  return { html: await res.text(), url: res.url };
}

async function postPage(path, data = {}) {
  const cookieString = getSessionCookie();
  if (!cookieString) throw new Error('No session available (401)');

  const params = new URLSearchParams(data);
  const res = await fetch(BASE_URL + path, {
    method: 'POST',
    headers: {
      'Cookie': cookieString,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': BASE_URL + '/dashboard.php',
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

module.exports = { login, logout, fetchPage, fetchPageWithUrl, postPage, asyncLocalStorage };
