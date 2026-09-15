const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_upgrade.html', 'utf8'));

const links = [];
$('a').each((i, el) => {
  const href = $(el).attr('href');
  if (href && href.includes('subview')) {
    links.push($(el).text().trim() + ' -> ' + href);
  }
});
console.log(links.join('\n'));
