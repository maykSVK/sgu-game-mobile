const fs = require("fs");
const path = "c:/GitHub/sgu-game-mobile/proxy/auth.js";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  /const SESSION_FILE = __dirname \+ '\/session\.json';[\s\S]*?function saveSession\(\) \{[\s\S]*?\}\s*catch\(e\) \{\}\s*\}/m,
  "function saveSession() {\n  // Vypnute: server si nebude pamatat session do suboru (ponechane na klienta)\n}"
);

fs.writeFileSync(path, content);

// tiez vymazeme samotny session.json ak existuje
const sessionFile = "c:/GitHub/sgu-game-mobile/proxy/session.json";
if (fs.existsSync(sessionFile)) {
  fs.unlinkSync(sessionFile);
}
