const express = require('express');
const router = express.Router();
const Shipment = require('../../models/Shipment');

// GET /api/shipments — list all shipments
router.get('/', async (req, res) => {
  try {
    const { status, minRisk } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (minRisk) filter.riskScore = { $gte: parseInt(minRisk) };

    const shipments = await Shipment.find(filter).sort({ riskScore: -1 }).limit(100);
    res.json({ count: shipments.length, shipments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});

// GET /api/shipments/heatmap — data for the risk heatmap
router.get('/heatmap', async (req, res) => {
  try {
    const shipments = await Shipment.find({}, {
      'origin.lat': 1, 'origin.lng': 1, 'origin.name': 1,
      'destination.lat': 1, 'destination.lng': 1, 'destination.name': 1,
      riskScore: 1, status: 1, shipmentId: 1
    });

    // Aggregate risk by location
    const locationRisk = {};
    shipments.forEach(s => {
      [s.origin, s.destination].forEach(loc => {
        if (loc.lat && loc.lng) {
          const key = `${loc.lat},${loc.lng}`;
          if (!locationRisk[key]) {
            locationRisk[key] = { lat: loc.lat, lng: loc.lng, name: loc.name, totalRisk: 0, count: 0 };
          }
          locationRisk[key].totalRisk += s.riskScore;
          locationRisk[key].count += 1;
        }
      });
    });

    const heatmapData = Object.values(locationRisk).map(loc => ({
      ...loc,
      avgRisk: Math.round(loc.totalRisk / loc.count),
      intensity: Math.min(1, (loc.totalRisk / loc.count) / 100)
    }));

    res.json(heatmapData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate heatmap data' });
  }
});

// GET /api/shipments/:id
router.get('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ shipmentId: req.params.id });
    if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipment' });
  }
});

module.exports = router;
