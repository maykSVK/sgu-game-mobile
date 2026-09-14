const auth = require('./proxy/auth.js');
async function test() {
  const html = await auth.fetchPage('/research.php?msg=not_time');
  const m = html.match(/notyf\.(error|success)\(['"](.*?)['"]/);
  console.log(m ? m[2] : 'not found');
}
test();
