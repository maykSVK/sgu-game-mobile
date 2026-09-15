const cheerio = require('cheerio');

function parseArtifacts(html) {
  const $ = cheerio.load(html);
  const artifacts = [];
  
  $('.infobox-standard, .infobox-alert').each((i, el) => {
    const title = $(el).find('.infobox-standard-title, .infobox-alert-title').text().trim();
    if (title.includes('Herní chat') || title.includes('Herní chat')) return;
    
    const className = $(el).attr('class');
    let imageClass = $(el).find('.artifact').attr('class') || '';
    imageClass = imageClass.trim();
    
    // Hide original image in the table
    $(el).find('.artifact').parent().css('display', 'none');
    const cleanedHtml = $(el).find('.infobox-standard-body, .infobox-alert-body').html();
    
    artifacts.push({
      title,
      html: cleanedHtml,
      class: className,
      imageClass
    });
  });
  
  return { artifacts };
}

module.exports = { parseArtifacts };
