const express = require('express');
const router = express.Router();
const Alert = require('../../models/Alert');

// GET /api/alerts — list active alerts
router.get('/', async (req, res) => {
  try {
    const { severity, type, active } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    if (active !== undefined) filter.isActive = active === 'true';
    else filter.isActive = true;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ count: alerts.length, alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// GET /api/alerts/:id
router.get('/:id', async (req, res) => {
  try {
    const alert = await Alert.findOne({ alertId: req.params.id });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

// PATCH /api/alerts/:id/action — approve reroute or ignore
router.patch('/:id/action', async (req, res) => {
  try {
    const { action } = req.body; // 'approved' or 'ignored'
    const alert = await Alert.findOne({ alertId: req.params.id });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.mitigation.status = action;
    if (action === 'approved' || action === 'ignored') {
      alert.acknowledgedAt = new Date();
    }
    if (action === 'resolved') {
      alert.isActive = false;
      alert.resolvedAt = new Date();
    }

    await alert.save();
    res.json({ message: `Alert ${action}`, alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

module.exports = router;
