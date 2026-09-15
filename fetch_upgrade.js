const { fetchPage } = require('./proxy/auth');
const fs = require('fs');

async function testUpgrade() {
  const html = await fetchPage('/upgrade.php?subview=weapon_system');
  fs.writeFileSync('test_upgrade.html', html);
  console.log('Saved to test_upgrade.html, length:', html.length);
}

testUpgrade();
