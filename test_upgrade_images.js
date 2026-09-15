const { fetchPage } = require('./proxy/auth');
const cheerio = require('./proxy/node_modules/cheerio');

async function checkUpgrade(subview) {
  const html = await fetchPage(`/upgrade.php?subview=${subview}`);
  const $ = cheerio.load(html);
  
  const box0 = $('.infobox-standard, .infobox-alert').eq(0);
  const imgClass = box0.find('.upgrade-img').attr('class');
  console.log(`${subview}: ${imgClass}`);
}

async function main() {
  const views = ['weapon_system', 'neural_armchair', 'filters', 'ftl', 'resources', 'shields', 'chambers', 'sublight'];
  for (const v of views) {
    await checkUpgrade(v);
  }
}
main();
