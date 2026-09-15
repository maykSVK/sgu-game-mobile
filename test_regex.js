const fs = require('fs');
const html = fs.readFileSync('test_universe.html', 'utf8');

const scriptMatch = html.match(/<script language="JavaScript" type="text\/javascript">([\s\S]*?)<\/script>/);
if (scriptMatch) {
  const scriptContent = scriptMatch[1];
  const xMatch = scriptContent.match(/x\s*=\s*(-?\d+(\.\d+)?);/);
  const yMatch = scriptContent.match(/y\s*=\s*(-?\d+(\.\d+)?);/);
  console.log('x:', xMatch ? xMatch[1] : 'null');
  console.log('y:', yMatch ? yMatch[1] : 'null');
} else {
  console.log('No script match');
}
