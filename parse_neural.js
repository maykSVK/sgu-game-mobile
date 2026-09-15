const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const html = fs.readFileSync('test_neural.html', 'utf8');
const $ = cheerio.load(html);

// We need to parse what information is on this page.
// The user says "implementuj vsetko ako tam je aj s akciami, funkcnymi tlacidlami, casovacmi a pod"
const result = {};

const infoboxes = [];
$('.infobox').each((i, el) => {
    infoboxes.push($(el).text().trim());
});

const content = $('.content-box').text().trim();

console.log(JSON.stringify({ infoboxes, length: content.length, htmlSubstring: $('.content-box').html().substring(0, 500) }, null, 2));
