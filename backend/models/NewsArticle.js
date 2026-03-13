const mongoose = require('mongoose');

const newsArticleSchema = new mongoose.Schema({
  headline: { type: String, required: true },
  source: String,
  url: String,
  publishedAt: { type: Date, default: Date.now },
  sentiment: {
    score: { type: Number, min: -1, max: 1 },
    label: { type: String, enum: ['positive', 'negative', 'neutral'] },
    confidence: { type: Number, min: 0, max: 1 }
  },
  entities: [{
    text: String,
    type: { type: String, enum: ['location', 'organization', 'event', 'commodity', 'port'] }
  }],
  category: { type: String, enum: ['geopolitical', 'weather', 'labor', 'trade', 'logistics', 'economic', 'other'] },
  relevanceScore: { type: Number, min: 0, max: 1, default: 0.5 },
  region: String
}, { timestamps: true });

module.exports = mongoose.model('NewsArticle', newsArticleSchema);
