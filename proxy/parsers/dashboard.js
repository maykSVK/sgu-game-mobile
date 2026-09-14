const cheerio = require('cheerio');

function parseDashboard(html) {
  const $ = cheerio.load(html);

  const data = {
    resources: {},
    stats: {},
    alerts: [],
    quests: [],
    infoboxes: [],
    chat: [],
    player: {
      username: '',
      rankClass: ''
    }
  };

  // Player info
  const profileLink = $('a[href*="playerName="]').first();
  data.player.username = profileLink.text().trim();
  const rankDiv = $('.rank-standard').first();
  if (rankDiv.length) {
    data.player.rankClass = rankDiv.attr('class').replace('inline v-a-m', '').replace('sgu-tooltip', '').trim();
  }

  // Resources
  $('.panel-resources div').each((i, el) => {
    const cls = $(el).attr('class');
    if (cls && !cls.includes('pt-2')) {
       const key = cls.split(' ')[0];
       const val = $(el).text().trim().replace(/\s+/g, ' ');
       if (key && val) data.resources[key] = val;
    }
  });

  // Stats
  $('#panelTabPlayer div').each((i, el) => {
    const cls = $(el).attr('class');
    if (cls && ['attack-power', 'shields', 'speed', 'science', 'gates-in-range'].includes(cls.split(' ')[0])) {
       let key = cls.split(' ')[0];
       const text = $(el).text().trim().replace(/\s+/g, ' ');
       
       // Pôvodná hra má bug: Posádka má rovnakú CSS triedu "gates-in-range"
       if (key === 'gates-in-range' && text.toLowerCase().includes('pos')) {
           key = 'crew';
       }

       if (key && text) data.stats[key] = text;
    }
  });

  // Alerts
  $('#alerts .crew-alert').each((i, el) => {
    data.alerts.push($(el).text().trim().replace(/\s+/g, ' '));
  });

  // Quest Log
  $('#panelTabQuestLog').text().trim().split('\\n').forEach(l => {
    if (l.trim()) data.quests.push(l.trim());
  });

  // Check for new reports
  data.hasNewReport = $('#newBattleReport').length > 0;

  // Generic Infoboxes (Orders, Economy, etc.)
  $('.infobox-standard').each((i, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    if (title && !title.includes('Výstrahy') && !title.includes('Notifikace') && !title.includes('chat')) {
      const body = $(el).find('.infobox-standard-body').text().trim().replace(/\\s+/g, ' ');
      if (title && body) {
         data.infoboxes.push({ title, content: body.substring(0, 300) });
      }
    }
  });

  // Chat
  $('#chat-messages-container .message').each((i, el) => {
    if (i < 10) { // Limit to 10 recent messages
       data.chat.push($(el).text().trim().replace(/\\s+/g, ' '));
    }
  });

  return data;
}

module.exports = { parseDashboard };
