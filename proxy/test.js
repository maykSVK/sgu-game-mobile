const cheerio = require('cheerio');
const html = `<div class="infobox-standard"><div class="infobox-standard-title">Hrác</div><div class="infobox-standard-body"><table><tr><td><span class="country-flag"><img src="/img/flags/sk.png"></span> <div class="player" style="display: inline-block;"><a href="/stats.php?subview=profile&playerName=Mayk">Mayk</a></div></td></tr><tr><td><img class="forums-avatar" src="/app/data/avatars/1.jpg"></td></tr></table></div></div>`;
const $ = cheerio.load(html);
const body = $('.infobox-standard-body');
console.log("Name:", body.find('a[href*="playerName="]').text());
