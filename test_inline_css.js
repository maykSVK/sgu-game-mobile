const { fetchPage } = require('./proxy/auth');
const cheerio = require('./proxy/node_modules/cheerio');

async function test() {
  const html = await fetchPage('/upgrade.php?subview=weapon_system');
  const $ = cheerio.load(html);
  
  const styles = $('style').map((i, el) => $(el).html()).get();
  styles.forEach((s, i) => {
    if (s.includes('upgrade-weapons')) {
      console.log('Found in inline style ' + i);
    }
  });
}
test();
