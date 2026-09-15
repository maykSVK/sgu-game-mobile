const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_upgrade_post_1250.html', 'utf8'));
console.log($('.heading').eq(0).text().trim());
console.log($('.infobox-alert-body').text().trim());
