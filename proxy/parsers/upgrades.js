const cheerio = require('cheerio');

function parseUpgrade(html) {
  const $ = cheerio.load(html);
  
  // Nájdi všetky infoboxy
  const infoboxes = $('.infobox-standard, .infobox-alert').toArray();
  
  // Zoberieme správy z infobox-alert
  const messages = [];
  
  let headerBox = null;
  let levelsBox = null;

  for (let i = 0; i < infoboxes.length; i++) {
    const el = infoboxes[i];
    const isAlert = $(el).hasClass('infobox-alert');
    const title = $(el).find('.infobox-standard-title, .infobox-alert-title').text().trim();
    
    // Ignorujeme herný chat
    if (title.includes('Herní chat')) continue;
    
    // Ak je to alert, je to správa
    if (isAlert) {
      const body = $(el).find('.infobox-alert-body').text().trim();
      messages.push({ text: body || title, type: title.toLowerCase().includes('chyb') ? 'error' : 'success' });
      continue;
    }
    
    // Ak to nie je alert, zistíme či je to header alebo levels
    if ($(el).find('.upgrade-img').length > 0) {
      headerBox = $(el);
    } else if ($(el).find('table').length > 0 && title.includes('Vylepšení')) {
      levelsBox = $(el);
    }
  }

  // Fallback ak nenájde presne (pre istotu)
  if (!headerBox) headerBox = $('.infobox-standard').eq(0);
  if (!levelsBox) levelsBox = $('.infobox-standard').eq(1);

  // Parse Header Box
  const title = headerBox.find('.infobox-standard-title').text().trim();
  
  let imageClass = '';
  const imgElement = headerBox.find('.upgrade-img');
  if (imgElement.length) {
    const classes = imgElement.attr('class').split(' ');
    imageClass = classes.find(c => c.startsWith('upgrade-') && c !== 'upgrade-img') || '';
  }
  
  const currentLevelText = headerBox.find('.heading').text().trim() || 'level 0';

  // Parse Levels Box
  const levels = [];
  let loreHtml = '';

  if (levelsBox) {
    const rows = levelsBox.find('tbody tr');
    rows.each((i, row) => {
      if (i === 0) return; // skip header
      
      const cols = $(row).find('td');
      if (cols.length === 5) {
        levels.push({
          level: $(cols[0]).text().trim(),
          reqHtml: $(cols[1]).html(),
          priceHtml: $(cols[2]).html(),
          effectHtml: $(cols[3]).html(),
          formHtml: $(cols[4]).find('form').length ? $(cols[4]).html() : null
        });
      } else if (cols.length === 1 && $(cols[0]).attr('colspan') === '5') {
        loreHtml = $(cols[0]).find('div').html();
      }
    });
  }

  return {
    title,
    imageClass,
    currentLevel: currentLevelText,
    levels,
    loreHtml,
    messages
  };
}

module.exports = { parseUpgrade };
