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
  const reportEl = $('#newBattleReport');
  data.hasNewReport = reportEl.length > 0 && !(reportEl.attr('style') || '').includes('visibility: hidden');
  
  // Ship status
  data.shipStatus = [];
  $('span.panel-heading:contains("Stav")').next('div').find('p').each((i, el) => {
    const p = $(el);
    let text = p.text().trim().replace(/\s+/g, ' ');
    const countdownTarget = p.find('[data-countdown]').attr('data-countdown') || null;

    if (text) {
        if (!text.includes('bitevn') || data.hasNewReport) {
            data.shipStatus.push({ text, countdown: countdownTarget });
        }
    }
  });

  // Generic Infoboxes (Orders, Economy, etc.)
  $('.infobox-standard').each((i, el) => {
    const title = $(el).find('.infobox-standard-title').text().trim();
    // Chceme získať aj 'Notifikace' a ostatné, takže to už nebudeme filtrovať tu, 
    // okrem 'Chat' (ten má svoju vlastnú kategóriu alebo ho na dashboarde nechceme).
    if (title && !title.includes('chat') && !title.includes('Chat')) {
      let bodyHtml = $(el).find('.infobox-standard-body').html();
      if (title && bodyHtml) {
         data.infoboxes.push({ title, html: bodyHtml.trim() });
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
