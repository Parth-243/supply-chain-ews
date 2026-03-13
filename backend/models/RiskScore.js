const mongoose = require('mongoose');

const riskScoreSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true },
  overallScore: { type: Number, min: 0, max: 100, required: true },
  components: {
    anomalyScore: { type: Number, min: 0, max: 100 },
    sentimentRisk: { type: Number, min: 0, max: 100 },
    weatherRisk: { type: Number, min: 0, max: 100 },
    historicalDelay: { type: Number, min: 0, max: 100 }
  },
  predictedDelay: { type: Number, default: 0 },
  confidence: { type: Number, min: 0, max: 1 },
  modelVersion: String,
  isSimulation: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('RiskScore', riskScoreSchema);
