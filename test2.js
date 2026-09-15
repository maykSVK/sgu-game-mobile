const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const $ = cheerio.load(fs.readFileSync('test_buildings.html', 'utf8'));
console.log($('.infobox-standard-body').first().html().substring(0, 1500));
