const fs = require('fs');
const cheerio = require('./proxy/node_modules/cheerio');
const html = fs.readFileSync('test_upgrade_error.html', 'utf8');
const $ = cheerio.load(html);

console.log('--- infobox-alert ---');
$('.infobox-alert').each((i, el) => console.log($(el).text().trim().replace(/\s+/g, ' ').substring(0, 50)));

console.log('--- infobox-standard ---');
$('.infobox-standard').each((i, el) => console.log($(el).text().trim().replace(/\s+/g, ' ').substring(0, 50)));

console.log('--- sgu-toast ---');
$('.sgu-toast').each((i, el) => console.log($(el).text().trim().replace(/\s+/g, ' ').substring(0, 50)));

console.log('--- ANY OTHER ERROR ---');
$('.error, .failed, .red').each((i, el) => console.log($(el).text().trim().replace(/\s+/g, ' ').substring(0, 50)));
