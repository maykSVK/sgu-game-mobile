const { fetchPage } = require('./auth');
const fs = require('fs');

(async () => {
  try {
    const html = await fetchPage('/stats.php');
    fs.writeFileSync('stats.html', html);
    console.log('Saved stats.html');
  } catch (err) {
    console.error(err);
  }
})();
