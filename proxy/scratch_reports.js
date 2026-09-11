const { fetchPage } = require('./auth');
const cheerio = require('cheerio');

(async () => {
  try {
    const html = await fetchPage('/reports.php');
    const $ = cheerio.load(html);
    console.log($('.content-container').text().replace(/\s+/g, ' ').substring(0, 1000));
  } catch (e) {
    console.error(e);
  }
})();
