const mongoose = require('mongoose');

const modelPerformanceSchema = new mongoose.Schema({
  modelName: { type: String, required: true },
  version: String,
  metrics: {
    mae: { type: Number },
    rmse: { type: Number },
    f1Score: { type: Number },
    precision: { type: Number },
    recall: { type: Number },
    accuracy: { type: Number }
  },
  predictedVsActual: [{
    shipmentId: String,
    predictedDelay: Number,
    actualDelay: Number,
    error: Number
  }],
  dataPointsUsed: Number,
  trainingDuration: Number,
  evaluatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ModelPerformance', modelPerformanceSchema);
