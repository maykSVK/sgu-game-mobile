const fs = require('fs');
const html = fs.readFileSync('test_universe.html', 'utf8');

const scriptMatch = html.match(/<script language="JavaScript" type="text\/javascript">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.log('Script block not found');
  process.exit();
}
const scriptContent = scriptMatch[1];

const elements = [];

// Match offset assignments: $('#planet-1').offset({left: universe.left + (505),top: universe.top + 1000 - (425)});
const offsetRegex = /\$\('#([^']+)'\)\.offset\(\{left: universe\.left \+ \(([^)]+)\),top: universe\.top \+ 1000 - \(([^)]+)\)\}/g;
let match;
while ((match = offsetRegex.exec(scriptContent)) !== null) {
  elements.push({
    id: match[1],
    x: parseInt(match[2]),
    y: parseInt(match[3])
  });
}

// Write to file for inspection
fs.writeFileSync('parsed_elements.json', JSON.stringify(elements, null, 2));
console.log('Extracted', elements.length, 'elements');
