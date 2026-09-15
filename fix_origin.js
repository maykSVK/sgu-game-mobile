const fs = require("fs");
const path = "c:/GitHub/sgu-game-mobile/proxy/routes/universe.routes.js";
let content = fs.readFileSync(path, "utf8");

const oldCodeRegex = /data\.destiny\.target = \{\s*x: parseFloat\(lineMatch\[3\]\),\s*y: parseFloat\(lineMatch\[4\]\)\s*\};/g;

const newCode = `data.destiny.origin = {
            x: parseFloat(lineMatch[1]),
            y: parseFloat(lineMatch[2])
          };
          data.destiny.target = {
            x: parseFloat(lineMatch[3]),
            y: parseFloat(lineMatch[4])
          };`;

content = content.replace(oldCodeRegex, newCode);
fs.writeFileSync(path, content);
