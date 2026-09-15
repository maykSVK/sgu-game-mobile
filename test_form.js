const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_upgrade.html', 'utf8'));
console.log($('form').eq(0).html());
