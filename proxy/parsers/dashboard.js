/**
 * Parser pre dashboard.php
 * Extrahuje: suroviny, notifikácie, stav hráča, countdown timery
 */
const cheerio = require('cheerio');

function parseDashboard(html) {
  const $ = cheerio.load(html);

  // --- Suroviny (resource bar) ---
  const resources = {};
  // Suroviny sú zvyčajne v elementoch s data atribútmi alebo špecifickými id/class
  // Hľadáme bežné vzory SGU-Game
  $('[id*="resource"], [class*="resource"], [data-resource]').each((i, el) => {
    const id = $(el).attr('id') || $(el).attr('data-resource') || '';
    const val = $(el).text().trim().replace(/\s+/g, '');
    if (id && val) resources[id] = val;
  });

  // Skús priamo podľa známych ID (z analýzy HTML)
  const knownResources = ['limestone', 'food', 'water', 'credits', 'research-points',
                          'energy', 'dark-matter', 'naquadah'];
  knownResources.forEach(key => {
    const el = $(`#${key}, .${key}, [data-res="${key}"]`).first();
    if (el.length) resources[key] = el.text().trim();
  });

  // --- Notifikácie / Alerts ---
  const alerts = [];
  $('#alerts .alert, .notification-item, [class*="alert"]').each((i, el) => {
    const text = $(el).text().trim();
    if (text && text.length > 2) alerts.push(text);
  });

  // --- Správy hráča (panel) ---
  const playerPanel = {};
  // Vytiahneme meno z odkazu na profil (ako si mi poslal: href="/stats.php?subview=profile&playerName=Mayk")
  const profileLink = $('a[href*="playerName="]').first();
  playerPanel.username = profileLink.text().trim();
  
  // Vytiahneme hodnosť z class "rank-standard"
  const rankDiv = $('.rank-standard').first();
  if (rankDiv.length) {
    playerPanel.rankClass = rankDiv.attr('class').replace('inline v-a-m', '').replace('sgu-tooltip', '').trim();
  }

  // --- Countdown timery (FTL, expedície...) ---
  const timers = [];
  $('[data-countdown]').each((i, el) => {
    timers.push({
      label: $(el).closest('[class]').find('.timer-label, h4, h3').first().text().trim() || `Timer ${i + 1}`,
      countdown: $(el).data('countdown') || $(el).attr('data-countdown'),
      current: $(el).text().trim(),
    });
  });

  // --- Aktívne queue položky (stavby, výskum...) ---
  const queue = [];
  $('.queue-item, [class*="queue"], .building-progress, .research-progress').each((i, el) => {
    queue.push({
      name: $(el).find('.name, h4, strong').first().text().trim(),
      remaining: $(el).find('[data-countdown], .countdown, .time-remaining').first().text().trim(),
    });
  });

  // --- Novinky / správy (blink elementy) ---
  const news = [];
  if ($('#newBattleReport').length) news.push({ type: 'battle_report', label: 'Nový bitevní report!' });
  if ($('#allianceNews').length) news.push({ type: 'alliance', label: 'Novinky v aliancii' });

  return {
    resources,
    alerts: alerts.slice(0, 20),
    player: playerPanel,
    timers,
    queue,
    news,
    raw_title: $('title').text().trim(),
  };
}

module.exports = { parseDashboard };
