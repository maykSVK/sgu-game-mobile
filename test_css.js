const { fetchPage } = require('./proxy/auth');

async function test() {
  const main = await fetchPage('/css/main.css');
  const css2019 = await fetchPage('/css/2019.css');
  
  if (main.includes('upgrade-weapons')) console.log('Found in main.css');
  if (css2019.includes('upgrade-weapons')) console.log('Found in 2019.css');
}
test();
