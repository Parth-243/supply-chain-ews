const express = require('express');
const router = express.Router();
const latencyTracker = require('../../middleware/latencyTracker');

// GET /api/health — system health metrics
router.get('/', async (req, res) => {
  try {
    const latencyData = latencyTracker.getLatencyData();
    const memUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      uptime: Math.round(process.uptime()),
      apiLatency: {
        average: Math.round(latencyData.average * 100) / 100,
        samples: latencyData.samples.slice(-20).map(s => ({
          timestamp: s.timestamp,
          duration: s.duration,
          path: s.path
        }))
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100,
        rss: Math.round(memUsage.rss / 1024 / 1024 * 100) / 100
      },
      mongoIngestion: {
        rate: Math.round(Math.random() * 50 + 20), // Placeholder — replace with real counter
        unit: 'docs/min'
      },
      mlServiceStatus: await checkMLService(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Health check failed' });
  }
});

async function checkMLService() {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${mlUrl}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    return response.ok ? 'connected' : 'degraded';
  } catch {
    return 'disconnected';
  }
}

module.exports = router;
