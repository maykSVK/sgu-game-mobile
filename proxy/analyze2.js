const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('dashboard.html', 'utf8');
const $ = cheerio.load(html);

const data = {
  resources: {},
  stats: {},
  quests: [],
  alerts: [],
  infoboxes: []
};

$('.panel-resources div').each((i, el) => {
  const cls = $(el).attr('class');
  if (cls && !cls.includes('pt-2')) {
     const val = $(el).text().trim().replace(/\s+/g, ' ');
     data.resources[cls.split(' ')[0]] = val;
  }
});

$('#panelTabPlayer div').each((i, el) => {
  const cls = $(el).attr('class');
  if (cls && ['attack-power', 'shields', 'speed', 'science', 'gates-in-range'].includes(cls.split(' ')[0])) {
     const val = $(el).text().trim().replace(/\s+/g, ' ');
     data.stats[cls.split(' ')[0]] = val;
  }
});

$('#alerts .crew-alert').each((i, el) => {
  data.alerts.push($(el).text().trim().replace(/\s+/g, ' '));
});

$('#panelTabQuestLog').text().trim().split('\n').forEach(l => {
  if (l.trim()) data.quests.push(l.trim());
});

$('.infobox-standard').each((i, el) => {
  const title = $(el).find('.infobox-standard-title').text().trim();
  if (title) {
    data.infoboxes.push({title, len: $(el).text().trim().length});
  }
});

fs.writeFileSync('analyze2.json', JSON.stringify(data, null, 2));
