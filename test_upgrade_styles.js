const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_upgrade.html', 'utf8'));

const links = [];
$('link[rel="stylesheet"]').each((i, el) => {
  links.push($(el).attr('href'));
});
console.log(links.join('\n'));
