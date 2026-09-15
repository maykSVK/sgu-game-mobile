const fs = require('fs');
const cheerio = require('cheerio');
const html = fs.readFileSync('test_universe.html', 'utf8');

const data = { destiny: { x: 0, y: 0, radius: 100 } };
const scriptMatch = html.match(/<script language="JavaScript" type="text\/javascript">([\s\S]*?)<\/script>/);
if (scriptMatch) {
  const scriptContent = scriptMatch[1];

  const xMatch = scriptContent.match(/x\s*=\s*(\d+);/);
  const yMatch = scriptContent.match(/y\s*=\s*(\d+);/);
  if (xMatch && yMatch) {
    data.destiny.x = parseInt(xMatch[1], 10);
    data.destiny.y = parseInt(yMatch[1], 10);
  }
}
console.log(data);
