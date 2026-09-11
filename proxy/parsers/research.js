const cheerio = require('cheerio');

function parseResearch(html) {
  const $ = cheerio.load(html);
  const researches = [];

  // Získame jednotlivé uzly stromu (technology)
  $('.skill-tree .skill-row .skill').each((i, el) => {
    const parentA = $(el).closest('a');
    const href = parentA.attr('href');
    let id = null;
    if (href) {
      const match = href.match(/technology=(\d+)/);
      if (match) id = match[1];
    }

    const name = $(el).find('.skill-title').text().replace(/\s+/g, ' ').trim();
    if (!name) return;

    // Zistíme status podľa CSS tried
    // "active" = už vyzkoumané
    let status = 'locked';
    if ($(el).hasClass('active')) {
      status = 'researched';
    } else if (!$(el).hasClass('disable-skill')) {
      // Ak by sa dalo klikať / bolo to odomknuté, ale nie je "active"
      // TODO: zistime, ci hra pouziva inu classu pre odomknute. 
      // V dump HTML sú všetky ne-active uzly "disable-skill".
      status = 'available';
    }

    researches.push({
      id,
      name,
      status
    });
  });

  // Skúsme zistiť, či je zobrazený skill-info-box s tlačidlom "Vyzkoumat" pre zistenie ceny atď.
  const selectedInfo = {};
  if ($('.skill-info-box').length > 0) {
    const box = $('.skill-info-box');
    selectedInfo.name = box.find('h3').text().trim();
    selectedInfo.price = box.find('h4').text().trim();
    selectedInfo.description = box.find('p').first().text().trim();
    
    // Tlačidlo Vyzkoumat
    const submitBtn = box.find('input[type="submit"]');
    if (submitBtn.length > 0) {
      if (submitBtn.val().includes('Probíhá')) {
        selectedInfo.status = 'researching';
      } else if (!submitBtn.is(':disabled')) {
        selectedInfo.status = 'available';
      } else {
        selectedInfo.status = 'locked';
      }
    }
    
    // Extract dependencies from info box
    const dependsOn = [];
    box.find('span.success, span.error, span[style*="color: red"]').each((i, el) => {
      // Skontrolujeme, či to je v odstavci "Požadované výzkumy"
      if ($(el).prevAll('span.bold:contains("Požadované výzkumy:")').length > 0) {
        dependsOn.push({
          name: $(el).text().replace(/\s+/g, ' ').trim(),
          met: $(el).hasClass('success')
        });
      }
    });
    selectedInfo.dependsOn = dependsOn;
  }

  return {
    researches,
    selectedInfo,
    raw_title: $('title').text().trim()
  };
}

module.exports = { parseResearch };
