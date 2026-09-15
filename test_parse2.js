const fs = require('fs');
const html = fs.readFileSync('test_universe.html', 'utf8');

const data = { destiny: { x: 0, y: 0, radius: 100 } };
const scriptMatch = html.match(/<script language="JavaScript" type="text\/javascript">([\s\S]*?)<\/script>/);
if (scriptMatch) {
  const scriptContent = scriptMatch[1];

  const xMatch = scriptContent.match(/x\s*=\s*(-?\d+(\.\d+)?);/);
  const yMatch = scriptContent.match(/y\s*=\s*(-?\d+(\.\d+)?);/);
  if (xMatch && yMatch) {
    data.destiny.x = parseFloat(xMatch[1]);
    data.destiny.y = parseFloat(yMatch[1]);
  }
}
console.log(data);
