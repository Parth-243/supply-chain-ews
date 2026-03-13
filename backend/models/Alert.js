const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
  type: { type: String, enum: ['port_closure', 'weather', 'geopolitical', 'congestion', 'strike', 'shortage', 'anomaly'], required: true },
  title: { type: String, required: true },
  description: String,
  affectedRoute: {
    from: String,
    to: String,
    region: String
  },
  riskScore: { type: Number, min: 0, max: 100 },
  shipmentIds: [String],
  mitigation: {
    suggestion: String,
    alternativeRoutes: [String],
    alternativeSuppliers: [String],
    estimatedCostImpact: Number,
    status: { type: String, enum: ['pending', 'approved', 'ignored', 'resolved'], default: 'pending' }
  },
  isActive: { type: Boolean, default: true },
  acknowledgedAt: Date,
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
