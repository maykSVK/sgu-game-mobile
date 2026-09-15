const fs = require('fs');
const html = fs.readFileSync('test_universe.html', 'utf8');

const scriptMatch = html.match(/<script language="JavaScript" type="text\/javascript">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.log('Script block not found');
  process.exit();
}
const scriptContent = scriptMatch[1];

const lines = scriptContent.split('\n').map(l => l.trim()).filter(l => l.includes('#destiny') || l.includes('destiny-radius'));
console.log(lines.join('\n'));
