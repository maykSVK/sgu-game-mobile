const fs = require('fs');
const path = 'c:/GitHub/sgu-game-mobile/proxy/routes/universe.routes.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/const xMatch = scriptContent\.match\(\/x\\s\*=\\s\*\\(\\d\+\\);\/\);/, 'const xMatch = scriptContent.match(/x\\\\s*=\\\\s*(-?\\\\d+(\\\\.\\\\d+)?);/);');
content = content.replace(/const yMatch = scriptContent\.match\(\/y\\s\*=\\s\*\\(\\d\+\\);\/\);/, 'const yMatch = scriptContent.match(/y\\\\s*=\\\\s*(-?\\\\d+(\\\\.\\\\d+)?);/);');

// Also update parseInt to parseFloat to support decimal coords!
content = content.replace('data.destiny.x = parseInt(xMatch[1], 10);', 'data.destiny.x = parseFloat(xMatch[1]);');
content = content.replace('data.destiny.y = parseInt(yMatch[1], 10);', 'data.destiny.y = parseFloat(yMatch[1]);');

fs.writeFileSync(path, content);
