const { fetchPage } = require('./proxy/auth');
const fs = require('fs');

async function testArtifacts() {
  const html = await fetchPage('/artifacts.php');
  fs.writeFileSync('test_artifacts.html', html);
  console.log('Saved to test_artifacts.html, length:', html.length);
}

testArtifacts();
