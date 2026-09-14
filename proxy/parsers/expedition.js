const cheerio = require('cheerio');

function parseExpedition(html) {
  const $ = cheerio.load(html);
  
  const infoboxes = [];
  $('.infobox-standard').each((_, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    // Chceme preskočiť herný chat (ako to bolo na dashboarde), ak sa tam nachádza
    if ($(el).hasClass('chat-box') || title.toLowerCase().includes('chat')) return;
    
    // Potrebujeme vytiahnuť celý obsah
    const bodyHtml = $(el).find('.infobox-standard-body').html();
    
    // Ponecháme to v surovom HTML
    if (title && bodyHtml) {
      infoboxes.push({
        title,
        html: bodyHtml
      });
    }
  });

  return { infoboxes };
}

module.exports = { parseExpedition };
