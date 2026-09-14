const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.connect({
    browserURL: 'http://localhost:9222'
  });
  const pages = await browser.pages();
  const page = pages.find(p => p.url().includes('sgu-game.cz'));
  if (page) {
    const html = await page.content();
    fs.writeFileSync('research-dump.html', html);
    console.log('Dumped to research-dump.html');
  } else {
    console.log('Page not found');
  }
  await browser.disconnect();
}
run();
