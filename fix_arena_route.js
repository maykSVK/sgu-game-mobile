const fs = require("fs");
const path = "c:/GitHub/sgu-game-mobile/proxy/routes/arena.routes.js";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
  "const { fetchPage, postPage, isLoggedIn } = require('../auth');",
  "const { fetchPage, fetchPageWithUrl, postPage, isLoggedIn } = require('../auth');"
);

content = content.replace(
  /const html = await fetchPage\('\/arena\.php', \{\s*method: 'POST',\s*headers: \{ 'Content-Type': 'application\/x-www-form-urlencoded' \},\s*body: new URLSearchParams\(req\.body\)\.toString\(\)\s*\}\);/,
  `const { html, url } = await fetchPageWithUrl('/arena.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(req.body).toString()
      });

      if (url.includes('report.php')) {
        // Redirection to battle report detected
        return res.json({ ok: true, redirectedToReport: true, url: url });
      }`
);

fs.writeFileSync(path, content);
