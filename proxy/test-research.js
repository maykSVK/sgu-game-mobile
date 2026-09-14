const { fetchPage } = require('./auth');
const fs = require('fs');

async function run() {
  try {
    const html = await fetchPage('/research.php');
    fs.writeFileSync('research-dump.html', html);
    console.log('Dumped to research-dump.html');
  } catch (err) {
    console.error(err);
  }
}
run();
