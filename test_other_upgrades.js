const { fetchPage } = require('./proxy/auth');
const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');

async function checkUpgrade(subview) {
  const html = await fetchPage(`/upgrade.php?subview=${subview}`);
  const $ = cheerio.load(html);
  
  console.log(`\n=== ${subview} ===`);
  const boxes = $('.infobox-standard, .infobox-alert').toArray();
  boxes.forEach((box, i) => {
    const title = $(box).find('.infobox-standard-title, .infobox-alert-title').text().trim();
    console.log(`[Box ${i}] ${title}`);
  });
}

async function main() {
  await checkUpgrade('co2_filters');
  await checkUpgrade('ftl_drive');
}
main();
