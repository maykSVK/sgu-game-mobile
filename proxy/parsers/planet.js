const cheerio = require('cheerio');

function parsePlanet(html) {
  const $ = cheerio.load(html);
  
  const infoboxes = [];
  $('.infobox-standard').each((_, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    if ($(el).hasClass('chat-box') || title.toLowerCase().includes('chat')) return;
    
    const bodyHtml = $(el).find('.infobox-standard-body').html();
    const className = $(el).attr('class');
    
    // Extract primary image class for native Vue rendering
    let imageClass = $(el).find('.infrastructure-img, .artifact, .planet-detail, .observatory, .satellite, .base').attr('class');
    if (imageClass) imageClass = imageClass.trim();
    
    // Hide the original image from the raw HTML so we can render it ourselves!
    const $body = cheerio.load(bodyHtml);
    $body('.infrastructure-img, .artifact, .planet-detail').parent().hide();
    const cleanedHtml = $body.html();

    if (title && bodyHtml) {
      infoboxes.push({
        title,
        html: cleanedHtml,
        class: className,
        imageClass
      });
    }
  });

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

module.exports = { parsePlanet };
