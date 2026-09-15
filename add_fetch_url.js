const fs = require("fs");
const path = "c:/GitHub/sgu-game-mobile/proxy/auth.js";
let content = fs.readFileSync(path, "utf8");

const newFunc = `async function fetchPageWithUrl(path, options = {}) {
  const cookieString = await getCookiesForUrl(BASE_URL);
  if (!cookieString) throw new Error('No session available');

  const res = await fetch(\`\${BASE_URL}\${path}\`, {
    ...options,
    headers: {
      'Cookie': cookieString,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': \`\${BASE_URL}/dashboard.php\`,
      ...options.headers
    },
    redirect: options.redirect || 'follow',
  });
  return { html: await res.text(), url: res.url };
}`;

content = content.replace("async function postPage", newFunc + "\n\nasync function postPage");
content = content.replace("module.exports = { login, logout, fetchPage, postPage, isLoggedIn, username };", "module.exports = { login, logout, fetchPage, fetchPageWithUrl, postPage, isLoggedIn, username };");

fs.writeFileSync(path, content);
