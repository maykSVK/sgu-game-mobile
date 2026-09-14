const cheerio = require('cheerio');

function parseHero(html) {
  const $ = cheerio.load(html);
  
  const messages = [];
  $('.flash.success').each((i, el) => messages.push({ type: 'success', text: $(el).text().trim() }));
  $('.flash.error').each((i, el) => messages.push({ type: 'error', text: $(el).text().trim() }));

  const heroes = [];
  $('.infobox-standard').each((_, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    if (!title) return;
    
    // Ignorujeme boxy, ktoré nie sú hrdinami (napr. Herní chat zo sidebar panelu)
    if (!['Nicholas Rush', 'Everett Young', 'Camile Wray'].includes(title)) {
      return;
    }
    
    // Zistime ci je tu button na set_next_hero
    const form = $(el).find('form');
    let nextHeroId = null;
    if (form.length) {
      nextHeroId = form.find('input[name="next_hero"]').val();
    }
    
    // Extract raw html of body
    const bodyHtml = $(el).find('.infobox-standard-body').html();
    
    heroes.push({
      title,
      html: bodyHtml,
      nextHeroId
    });
  });

  return { messages, heroes };
}

module.exports = { parseHero };
