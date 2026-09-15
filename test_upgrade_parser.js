const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_upgrade.html', 'utf8'));

console.log($('.infobox-standard').eq(0).find('.infobox-standard-body').html().trim());
