const cheerio = require('cheerio');

function parseArena(html) {
  const $ = cheerio.load(html);
  
  const messages = [];
  $('.flash.success').each((i, el) => messages.push({ type: 'success', text: $(el).text().trim() }));
  $('.flash.error').each((i, el) => messages.push({ type: 'error', text: $(el).text().trim() }));

  let statusHtml = '';
  let onlineWarriors = '';
  let stateHtml = '';
  let canApply = false;
  
  // Nájdenie status tabuľky (table s classou delimiter)
  const statusTable = $('table.delimiter');
  if (statusTable.length) {
    statusHtml = statusTable.find('tr').eq(0).find('td').eq(1).html() || '';
    onlineWarriors = statusTable.find('tr').eq(1).find('td').eq(1).text().trim() || '';
    stateHtml = statusTable.find('tr').eq(2).find('td').eq(1).html() || '';
    
    // Či existuje formulár na prihlásenie
    if (statusTable.find('input[name="get_into_arena"]').length > 0) {
      canApply = true;
    }
  }

  // Zoznam hráčov (tabuľka v .infobox-standard.x3)
  const players = [];
  const playersTable = $('.infobox-standard.x3 table tr').slice(1); // preskočí hlavičku
  
  playersTable.each((i, el) => {
    const tds = $(el).find('td');
    if (tds.length < 8) return; // Prázdna aréna správa (colspan)
    
    // Form action (útok)
    const form = tds.eq(7).find('form');
    let attackUserId = null;
    if (form.length) {
      attackUserId = form.find('input[name="user_id"]').val();
    }

    players.push({
      position: tds.eq(0).text().trim() || (tds.eq(0).find('.arena-winner').length ? '1.' : ''),
      isWinner: tds.eq(0).find('.arena-winner').length > 0,
      username: tds.eq(1).text().trim(),
      isVip: tds.eq(1).find('.vip').length > 0,
      battles: tds.eq(2).text().trim(),
      statsRow: tds.eq(3).text().trim(), // W-D-L
      points: tds.eq(4).text().trim(),
      fallen: tds.eq(5).text().trim(),
      fallenLimit: tds.eq(5).find('.failed').length > 0,
      drawn: tds.eq(6).text().trim(),
      drawnLimit: tds.eq(6).find('.failed').length > 0,
      canAttack: attackUserId !== null,
      attackUserId: attackUserId
    });
  });

  // Stránkovanie
  const pagination = {
    prevAvailable: false,
    nextAvailable: false,
    prevParams: null,
    nextParams: null
  };
  
  const prevForm = $('form[name="pagination-previous"]');
  if (prevForm.length && prevForm.find('input[type="submit"]:not(:disabled)').length) {
    pagination.prevAvailable = true;
    pagination.prevParams = {
      from: prevForm.find('input[name="from"]').val(),
      to: prevForm.find('input[name="to"]').val()
    };
  }
  
  const nextForm = $('form[name="pagination-next"]');
  if (nextForm.length && nextForm.find('input[type="submit"]:not(:disabled)').length) {
    pagination.nextAvailable = true;
    pagination.nextParams = {
      from: nextForm.find('input[name="from"]').val(),
      to: nextForm.find('input[name="to"]').val()
    };
  }

  return {
    messages,
    statusHtml: statusHtml.trim(),
    stateHtml: stateHtml.trim(),
    onlineWarriors,
    canApply,
    players,
    pagination
  };
}

module.exports = { parseArena };
