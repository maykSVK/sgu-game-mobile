const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222'
  });
  const pages = await browser.pages();
  const page = pages.find(p => p.url().includes('sgu-game.cz'));
  if (page) {
    const cookies = await page.cookies();
    const sessionCookie = cookies.find(c => c.name === 'PHPSESSID');
    if (sessionCookie) {
      console.log(`SESSION_COOKIE=${sessionCookie.value}`);
      fs.writeFileSync('session.txt', sessionCookie.value);
    } else {
      console.log('No PHPSESSID cookie found');
    }
  } else {
    console.log('Page not found');
  }
  await browser.disconnect();
}
run();
