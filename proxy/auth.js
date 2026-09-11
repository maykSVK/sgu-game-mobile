const fetch = require('node-fetch');
const puppeteer = require('puppeteer-core');
const { URLSearchParams } = require('url');

const BASE_URL = 'https://www.sgu-game.cz';

async function getChromeCookies() {
  try {
    const browser = await puppeteer.connect({ browserURL: 'http://localhost:9222' });
    const pages = await browser.pages();
    const page = pages.find(p => p.url().includes('sgu-game.cz'));
    if (!page) {
      await browser.disconnect();
      return null;
    }
    const cookies = await page.cookies();
    await browser.disconnect();
    
    return cookies.map(c => `${c.name}=${c.value}`).join('; ');
  } catch (err) {
    console.error('Failed to get Chrome cookies:', err);
    return null;
  }
}

async function login(username, password) {
  return { ok: false, error: 'Login is handled via Chrome debug session' };
}

async function logout() {
  return { ok: true };
}

async function fetchPage(path) {
  const cookieString = await getChromeCookies();
  if (!cookieString) throw new Error('No Chrome session available');

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': `${BASE_URL}/dashboard.php`,
    },
    redirect: 'follow',
  });
  return res.text();
}

async function postPage(path, data = {}) {
  const cookieString = await getChromeCookies();
  if (!cookieString) throw new Error('No Chrome session available');

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
  return true; // We assume the Chrome session is always logged in for this debug environment
}
function username() { return 'ChromeUser'; }

module.exports = { login, logout, fetchPage, postPage, isLoggedIn, username };
