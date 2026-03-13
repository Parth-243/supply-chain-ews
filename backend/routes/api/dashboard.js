const express = require('express');
const router = express.Router();
const Shipment = require('../../models/Shipment');
const Alert = require('../../models/Alert');
const RiskScore = require('../../models/RiskScore');
const NewsArticle = require('../../models/NewsArticle');
const ModelPerformance = require('../../models/ModelPerformance');
const latencyTracker = require('../../middleware/latencyTracker');

// GET /api/dashboard — aggregated dashboard data
router.get('/', async (req, res) => {
  try {
    // Get latest risk scores
    const latestScores = await RiskScore.find({ isSimulation: false })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate overall disruption index (average of top risk scores)
    const topScores = latestScores.slice(0, 10);
    const disruptionIndex = topScores.length > 0
      ? Math.round(topScores.reduce((sum, s) => sum + s.overallScore, 0) / topScores.length)
      : 0;

    // Get active critical alerts
    const activeAlerts = await Alert.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get latest model confidence
    const latestPerformance = await ModelPerformance.findOne()
      .sort({ createdAt: -1 });

    // Get predictive confidence (average confidence from recent scores)
    const avgConfidence = latestScores.length > 0
      ? latestScores.reduce((sum, s) => sum + (s.confidence || 0.5), 0) / latestScores.length
      : 0.5;

    // Get shipments at risk
    const atRiskShipments = await Shipment.find({ riskScore: { $gte: 60 } })
      .sort({ riskScore: -1 })
      .limit(20);

    // Get recent news
    const recentNews = await NewsArticle.find()
      .sort({ publishedAt: -1 })
      .limit(20);

    // Get system health
    const latencyData = latencyTracker.getLatencyData();

    res.json({
      disruptionIndex,
      predictiveConfidence: Math.round(avgConfidence * 100),
      activeAlerts: {
        count: activeAlerts.length,
        items: activeAlerts
      },
      atRiskShipments: {
        count: atRiskShipments.length,
        items: atRiskShipments
      },
      sentimentFeed: recentNews,
      riskScores: latestScores,
      modelPerformance: latestPerformance,
      systemHealth: {
        apiLatency: Math.round(latencyData.average * 100) / 100,
        uptime: process.uptime()
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

module.exports = router;
