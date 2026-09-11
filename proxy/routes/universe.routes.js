const express = require('express');
const router = express.Router();
router.get('/', (req, res) => res.json({ ok: true, data: { message: 'Universe – coming soon' } }));
module.exports = router;
