const fs = require("fs");
const path = "c:/GitHub/sgu-game-mobile/proxy/routes/universe.routes.js";
let content = fs.readFileSync(path, "utf8");

const oldTargetExtractor = /\/\/ Extract Target position if Destiny is flying[\s\S]*?\}\)/;
const newTargetExtractor = `
      // Extract Target position from the #universe.line function
      const lineRegex = /\\$\\("#universe"\\)\\.line\\(universe\\.left \\+ ([-\\d.]+),\\s*1120 - ([-\\d.]+),\\s*universe\\.left \\+ ([-\\d.]+),\\s*1120 - ([-\\d.]+)/;
      const lineMatch = scriptContent.match(lineRegex);
      if (lineMatch) {
        data.destiny.target = {
          x: parseFloat(lineMatch[3]),
          y: parseFloat(lineMatch[4])
        };
      }
`;

content = content.replace(/\/\/ Extract Target position if Destiny is flying[\s\S]*?(?=\/\/ Extract offsets)/, newTargetExtractor);

fs.writeFileSync(path, content);
