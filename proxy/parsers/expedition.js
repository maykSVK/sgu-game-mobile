const cheerio = require('cheerio');

function parseExpedition(html) {
  const $ = cheerio.load(html);
  
  const infoboxes = [];
  $('.infobox-standard').each((_, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    if ($(el).hasClass('chat-box') || title.toLowerCase().includes('chat')) return;
    
    const bodyHtml = $(el).find('.infobox-standard-body').html();
    
    if (title && bodyHtml) {
      infoboxes.push({
        title,
        html: bodyHtml
      });
    }
  });

  // Skúsime nájsť hlásenia z notyf (error alebo success)
  const messages = [];
  $('script').each((_, el) => {
    const scriptContent = $(el).html();
    if (scriptContent && scriptContent.includes('notyf.')) {
      const errorMatch = scriptContent.match(/notyf\.error\(['"]([^'"]+)['"]\)/);
      if (errorMatch) {
        messages.push({ type: 'error', text: errorMatch[1] });
      }
      const successMatch = scriptContent.match(/notyf\.success\(['"]([^'"]+)['"]\)/);
      if (successMatch) {
        messages.push({ type: 'success', text: successMatch[1] });
      }
    }
  });

  return { infoboxes, messages };
}

module.exports = { parseExpedition };
