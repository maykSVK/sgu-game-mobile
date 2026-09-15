const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_artifacts.html', 'utf8'));

const boxes = $('.infobox-standard, .infobox-alert').toArray();
boxes.forEach((box, i) => {
  const title = $(box).find('.infobox-standard-title, .infobox-alert-title').text().trim();
  console.log(`[Box ${i}] ${title}`);
  if (i < 3) {
    const html = $(box).find('.infobox-standard-body, .infobox-alert-body').html();
    console.log(html ? html.substring(0, 500) : 'NO BODY');
  }
});
