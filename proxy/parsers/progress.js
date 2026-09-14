const cheerio = require('cheerio');

function parseProgress(html) {
  const $ = cheerio.load(html);
  
  const infobox = $('.infobox-standard:contains("Postup ve hře")');
  let table = infobox.length ? infobox.find('table') : $('table').first();

  const missions = [];
  const rows = table.find('tr');

  if (rows.length >= 3) {
    const titles = $(rows[0]).find('th');
    const descriptions = $(rows[1]).find('td');
    const statuses = $(rows[2]).find('td');

    for (let i = 0; i < 4; i++) {
      if (titles[i] && descriptions[i] && statuses[i]) {
        missions.push({
          title: $(titles[i]).text().trim(),
          description: $(descriptions[i]).html().trim(),
          status: $(statuses[i]).html().trim(),
        });
      }
    }
  }

  let progressBarHtml = '';
  const progressContainer = table.find('.progress');
  if (progressContainer.length) {
    progressBarHtml = progressContainer.parent().html();
  }

  return { missions, progressBarHtml };
}

module.exports = { parseProgress };
