const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const html = fs.readFileSync('test_universe.html', 'utf8');
const $ = cheerio.load(html);

const content = $('.content-box').html() || $('#content').html() || $('body').html();
fs.writeFileSync('test_universe_extracted.html', content);
