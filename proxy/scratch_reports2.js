const { fetchPage } = require('./auth');
const cheerio = require('cheerio');

(async () => {
  try {
    const html = await fetchPage('/reports.php');
    const $ = cheerio.load(html);
    
    // Zistíme, ako vyzerá tlačítko "Zobrazit"
    $('a, button').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Zobrazit') || text.includes('Vše jako přečtené')) {
        console.log(text, '->', $(el).parent().html());
      }
    });

  } catch (e) {
    console.error(e);
  }
})();
