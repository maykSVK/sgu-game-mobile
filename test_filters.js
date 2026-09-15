const { fetchPage } = require('./proxy/auth');
const cheerio = require('./proxy/node_modules/cheerio');

async function test() {
  const html = await fetchPage('/upgrade.php?subview=filters');
  const $ = cheerio.load(html);
  const box0 = $('.infobox-standard, .infobox-alert').eq(0);
  console.log(box0.html());
}
test();
