const fetch = require('node-fetch');
const cheerio = require('cheerio');

(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3000/api/reports');
    const json = await res.json();
    const $ = cheerio.load(json.data.html);
    
    // Zistíme, ako vyzerá tlačítko "Zobrazit"
    $('a, button').each((i, el) => {
      const text = $(el).text().trim();
      if (text.includes('Zobrazit') || text.includes('Označit vše')) {
        console.log(text, '->', $(el).parent().html());
      }
    });

  } catch (e) {
    console.error(e);
  }
})();
