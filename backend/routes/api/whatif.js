const express = require('express');
const router = express.Router();

// POST /api/whatif — forward to ML service or simulate locally
router.post('/', async (req, res) => {
  try {
    const { portStatus, weatherSeverity, strikeProbability, congestionLevel, region } = req.body;

    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    try {
      // Try calling the ML service
      const response = await fetch(`${mlServiceUrl}/whatif`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portStatus, weatherSeverity, strikeProbability, congestionLevel, region })
      });

      if (response.ok) {
        const result = await response.json();
        return res.json(result);
      }
    } catch {
      // ML service not available, use local simulation
    }

    // Local fallback simulation
    const portFactor = portStatus === false ? 30 : 0;
    const weatherFactor = (weatherSeverity || 0) * 20;
    const strikeFactor = (strikeProbability || 0) * 25;
    const congestionFactor = (congestionLevel || 0) * 15;

    const simulatedRisk = Math.min(100, Math.round(
      portFactor + weatherFactor + strikeFactor + congestionFactor + Math.random() * 10
    ));

    const confidence = Math.max(0.3, Math.min(0.95, 1 - (Math.random() * 0.3)));

    res.json({
      simulatedRiskScore: simulatedRisk,
      confidence: Math.round(confidence * 100),
      breakdown: {
        portClosure: portFactor,
        weatherImpact: Math.round(weatherFactor),
        strikeRisk: Math.round(strikeFactor),
        congestion: Math.round(congestionFactor)
      },
      recommendation: simulatedRisk >= 80
        ? 'HIGH RISK: Immediate rerouting recommended'
        : simulatedRisk >= 50
          ? 'MODERATE RISK: Monitor closely, prepare contingency'
          : 'LOW RISK: Continue as planned',
      isSimulation: true
    });
  } catch (error) {
    res.status(500).json({ error: 'What-If simulation failed' });
  }
});

module.exports = router;
