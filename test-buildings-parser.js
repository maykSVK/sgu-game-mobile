const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');

const html = fs.readFileSync('test_buildings.html', 'utf8');
const $ = cheerio.load(html);

console.log('Titles:', $('.infobox-standard-title').map((i, el) => $(el).text().trim()).get());

const firstInfobox = $('.infobox-standard').first();
console.log('\nFirst infobox HTML snippet:');
console.log(firstInfobox.html().substring(0, 500));
