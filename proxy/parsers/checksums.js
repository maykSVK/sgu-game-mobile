const cheerio = require('cheerio');

function parseChecksums(html) {
  const $ = cheerio.load(html);
  
  const checksums = [];
  $('table.delimiter').each((_, el) => {
    const text = $(el).text();
    if (text.includes('Přepočet')) {
      const rows = $(el).find('tr');
      if (rows.length >= 4) {
        // Získame nadpis (napr. Přepočet [14.09. 00:00:04 - 14.09. 00:00:04])
        const title = $(rows[0]).find('th').text().trim();
        
        // Získame dáta "Před přepočtem"
        const beforeTds = $(rows[2]).find('td');
        const before = {
          label: $(beforeTds[0]).text().trim(),
          energy: $(beforeTds[1]).text().trim(),
          food: $(beforeTds[2]).text().trim(),
          water: $(beforeTds[3]).text().trim(),
          limestone: $(beforeTds[4]).text().trim(),
          credits: $(beforeTds[5]).text().trim(),
          research: $(beforeTds[6]).text().trim(),
          renown: $(beforeTds[7]).text().trim(),
        };

        // Získame dáta "Po přepočtu"
        const afterTds = $(rows[3]).find('td');
        const after = {
          label: $(afterTds[0]).text().trim(),
          energy: $(afterTds[1]).text().trim(),
          food: $(afterTds[2]).text().trim(),
          water: $(afterTds[3]).text().trim(),
          limestone: $(afterTds[4]).text().trim(),
          credits: $(afterTds[5]).text().trim(),
          research: $(afterTds[6]).text().trim(),
          renown: $(afterTds[7]).text().trim(),
        };

        checksums.push({ title, before, after });
      }
    }
  });

  return { checksums };
}

module.exports = { parseChecksums };
