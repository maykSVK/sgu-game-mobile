const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const researchRoutes = require('./routes/research.routes');
const universeRoutes = require('./routes/universe.routes');
const arenaRoutes = require('./routes/arena.routes');
const statsRoutes = require('./routes/stats.routes');
const ajaxRoutes = require('./routes/ajax.routes');
const reportsRoutes = require('./routes/reports.routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/universe', universeRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ajax', ajaxRoutes);
app.use('/api/reports', reportsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  const { isLoggedIn, username } = require('./auth');
  res.json({ ok: true, loggedIn: isLoggedIn(), username: username() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SGU-Mobile proxy beží na http://localhost:${PORT}`);
  console.log(`📱 Z mobilu (WiFi): http://<tvoja-IP>:${PORT}`);
  console.log(`   Zisti IP: ipconfig | findstr IPv4\n`);
});
