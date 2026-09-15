const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const html = fs.readFileSync('test_neural.html', 'utf8');
const $ = cheerio.load(html);

// the neural interface is likely inside #content or something. Let's find it.
const content = $('.content-box').html() || $('#content').html() || $('body').html();
fs.writeFileSync('test_neural_extracted.html', content);
