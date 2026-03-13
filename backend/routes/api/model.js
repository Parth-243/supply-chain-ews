const express = require('express');
const router = express.Router();
const ModelPerformance = require('../../models/ModelPerformance');

// GET /api/model — model performance history
router.get('/', async (req, res) => {
  try {
    const history = await ModelPerformance.find()
      .sort({ evaluatedAt: -1 })
      .limit(30);

    res.json({
      count: history.length,
      latest: history[0] || null,
      history
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch model performance' });
  }
});

module.exports = router;
