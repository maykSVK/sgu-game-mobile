const fs = require('fs');
const path = 'c:/GitHub/sgu-game-mobile/proxy/routes/universe.routes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace('const xMatch = scriptContent.match(/x\\\\s*=\\\\s*(-?\\\\d+(?:\\\\.\\\\d+)?);/);', 'const xMatch = scriptContent.match(/x\\s*=\\s*(-?\\d+(?:\\.\\d+)?);/);');
content = content.replace('const yMatch = scriptContent.match(/y\\\\s*=\\\\s*(-?\\\\d+(?:\\\\.\\\\d+)?);/);', 'const yMatch = scriptContent.match(/y\\s*=\\s*(-?\\d+(?:\\.\\d+)?);/);');

fs.writeFileSync(path, content);
