const cheerio = require('cheerio');

function parseBuildings(html) {
  const $ = cheerio.load(html);
  const planets = [];

  // Pôvodné infoboxy idú po pároch: [Planéta, Stavby, Planéta, Stavby...]
  const infoboxes = $('.infobox-standard, .infobox-alert').toArray();
  
  let currentPlanet = null;

  for (let i = 0; i < infoboxes.length; i++) {
    const el = infoboxes[i];
    const title = $(el).find('.infobox-standard-title, .infobox-alert-title').text().trim();
    if (title.includes('Herní chat') || title.includes('Herný chat')) continue;

    const bodyHtml = $(el).find('.infobox-standard-body, .infobox-alert-body').html();
    const className = $(el).attr('class');

    // Extract image properties for native Vue rendering
    let imageClass = $(el).find('.planet-bg, .infrastructure-img, .artifact, .planet-detail, .observatory, .satellite, .base').attr('class');
    if (imageClass) imageClass = imageClass.trim();

    // Remove the original images so we can render them beautifully ourselves
    let cleanedHtml = '';
    if (bodyHtml) {
      const $body = cheerio.load(bodyHtml);
      $body('.planet-bg, .infrastructure-img, .artifact, .planet-detail').parent().css('display', 'none');
      cleanedHtml = $body.html();
    }

    const boxData = {
      title,
      html: cleanedHtml,
      class: className,
      imageClass
    };

    // Ak title obsahuje 'Galaxie' alebo 'sveteln', ide o hlavičku planéty
    if (title.includes('Galaxie') || title.includes('vzdálen')) {
      currentPlanet = {
        planetBox: boxData,
        buildingsBox: null
      };
      planets.push(currentPlanet);
    } else if (title.includes('Stavby na')) {
      if (currentPlanet) {
        currentPlanet.buildingsBox = boxData;
      }
    }
  }

  return { planets };
}

module.exports = { parseBuildings };
