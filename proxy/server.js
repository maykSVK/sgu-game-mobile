const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const researchRoutes = require('./routes/research.routes');
const universeRoutes = require('./routes/universe.routes');
const arenaRoutes = require('./routes/arena.routes');
const crewRoutes = require('./routes/crew.routes');
const statsRoutes = require('./routes/stats.routes');
const ajaxRoutes = require('./routes/ajax.routes');
const reportsRoutes = require('./routes/reports.routes');
const destinyRoutes = require('./routes/destiny.routes');
const expeditionRoutes = require('./routes/expedition.routes');
const planetRoutes = require('./routes/planet.routes');
const checksumsRoutes = require('./routes/checksums.routes');
const heroRoutes = require('./routes/hero.routes');
const progressRoutes = require('./routes/progress.routes');
const { asyncLocalStorage } = require('./auth');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// AsyncLocalStorage Middleware pre Session (Stateless proxy)
app.use((req, res, next) => {
  const token = req.headers['x-sgu-session'] || null;
  asyncLocalStorage.run({ token }, () => {
    next();
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/universe', universeRoutes);
app.use('/api/arena', arenaRoutes);
app.use('/api/crew', crewRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ajax', ajaxRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/destiny', destinyRoutes);
app.use('/api/expedition', expeditionRoutes);
app.use('/api/planet', planetRoutes);
app.use('/api/checksums', checksumsRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/buildings', require('./routes/buildings.routes'));
app.use('/api/artifacts', require('./routes/artifacts.routes'));
app.use('/api/upgrades', require('./routes/upgrades.routes'));
app.use('/api/neural', require('./routes/neural.routes'));
app.use('/api/stargate', require('./routes/stargate.routes'));
app.use('/api/forums', require('./routes/forums.routes'));
app.use('/api/messages', require('./routes/messages.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 SGU-Mobile proxy bezi na http://localhost:' + PORT);
});
