const cheerio = require('cheerio');

function parseCrew(html) {
  const $ = cheerio.load(html);
  
  const messages = [];
  $('.flash.success').each((i, el) => messages.push({ type: 'success', text: $(el).text().trim() }));
  $('.flash.error').each((i, el) => messages.push({ type: 'error', text: $(el).text().trim() }));

  const data = {
    messages,
    professions: [],
    stats: {
      total: 0,
      allocated: 0,
      available: 0,
    },
    consumptionHtml: '',
    qualifications: [],
    unlockableProfessions: [],
    fireCrew: {
      max: 0
    }
  };

  // 1. Rozmístění členů posádky (Allocation)
  $('input[name^="profession_"]').each((i, el) => {
    const input = $(el);
    const name = input.attr('name'); // profession_1, profession_2, ...
    const value = parseInt(input.val(), 10) || 0;
    const isLocked = input.css('display') === 'none' || input.siblings('.failed').length > 0;
    const tr = input.closest('tr');
    
    let title = tr.find('td').eq(0).text().trim();
    let desc = tr.find('td').eq(1).text().trim();
    let effectStr = tr.find('td').eq(3).text().trim().replace(/^\+\s*/, '');
    
    data.professions.push({
      id: name,
      title: title,
      desc: desc,
      value: value,
      isLocked: isLocked,
      effect: effectStr
    });
  });

  // 2. Informace o posádce (Stats & Consumption)
  // Prvá tabuľka v 'Informace o posádce'
  const infoSection = $('.infobox-standard:contains("Informace o posádce")');
  if (infoSection.length) {
    const statsTr = infoSection.find('table').eq(0).find('tr').eq(1);
    data.stats.total = parseInt(statsTr.find('td').eq(0).text().trim(), 10) || 0;
    data.stats.allocated = parseInt(statsTr.find('td').eq(1).text().trim(), 10) || 0;
    data.stats.available = parseInt(statsTr.find('td').eq(2).text().trim(), 10) || 0;
    
    // Spotreba - nachádza sa v delimiter tabuľke
    const consTd = infoSection.find('.delimiter table tr').eq(1).find('td').eq(0);
    if (consTd.length) {
      data.consumptionHtml = consTd.html().trim();
    }
  }

  // 3. Vzdělání a kvalifikace (Qualifications)
  const eduSection = $('.infobox-standard:contains("Vzdělání a kvalifikace")');
  if (eduSection.length) {
    const eduTrs = eduSection.find('table').eq(0).find('tr').slice(1);
    eduTrs.each((i, el) => {
      const tds = $(el).find('td');
      const title = tds.eq(0).text().trim();
      const price = tds.eq(1).text().trim();
      
      const form = tds.eq(2).find('form');
      let isUnlocked = tds.eq(2).find('.success').length > 0;
      let level = null;
      if (form.length) {
        level = form.find('input[name="edu_level"]').val();
      }

      data.qualifications.push({
        title,
        price,
        isUnlocked,
        levelId: level
      });
    });
    
    // Súčasná kvalifikácia text
    const currentEduTd = eduSection.find('.delimiter table tr').eq(0).find('td').eq(0);
    if (currentEduTd.length) {
      data.currentQualification = currentEduTd.text().replace(/\s+/g, ' ').trim();
    }
  }

  // 4. Profese (Unlockable professions like Scientist, Cook)
  const profSection = $('.infobox-standard:contains("Profese")').eq(1); // Druhý infobox s nadpisom profese (prvý je Rozmístění)
  // actually the first one is "Rozmístění členů posádky" so:
  const unlockProfSection = $('.infobox-standard').filter((i, el) => $(el).find('.infobox-standard-title').text().includes('Profese'));
  if (unlockProfSection.length) {
    const unlockTrs = unlockProfSection.find('table').eq(0).find('tr').slice(1);
    unlockTrs.each((i, el) => {
      const tds = $(el).find('td');
      const title = tds.eq(0).text().trim();
      if (!title) return; // sometimes empty row
      const price = tds.eq(1).text().trim();
      
      const form = tds.eq(2).find('form');
      let isUnlocked = tds.eq(2).find('.success').length > 0;
      let profId = null;
      if (form.length) {
        profId = form.find('input[name="profession"]').val();
      }

      data.unlockableProfessions.push({
        title,
        price,
        isUnlocked,
        profId
      });
    });
  }

  // 5. Propuštění posádky (Fire crew)
  const fireSection = $('.infobox-standard:contains("Propuštění posádky")');
  if (fireSection.length) {
    const input = fireSection.find('input[name="crew"]');
    if (input.length) {
      data.fireCrew.max = parseInt(input.attr('max'), 10) || 0;
    } else {
      // maybe no input if max is 0 or something?
      const text = fireSection.find('td').text();
      const match = text.match(/Lze propustit:.*?(\d+)/);
      if (match) data.fireCrew.max = parseInt(match[1], 10);
    }
  }

  return data;
}

module.exports = { parseCrew };
