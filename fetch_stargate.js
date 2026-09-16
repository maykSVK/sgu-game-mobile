const { login, fetchPage } = require('./proxy/auth.js');
const fs = require('fs');
(async () => {
  // Let's use the asyncLocalStorage directly
  const { asyncLocalStorage } = require('./proxy/auth.js');
  
  // We need the credentials, but wait! We can just prompt or maybe there is a session in the browser.
  console.log("Need credentials...");
})();
