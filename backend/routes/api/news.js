const express = require('express');
const router = express.Router();
const NewsArticle = require('../../models/NewsArticle');

// GET /api/news — sentiment feed
router.get('/', async (req, res) => {
  try {
    const { category, sentiment, limit: queryLimit } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (sentiment) filter['sentiment.label'] = sentiment;

    const articles = await NewsArticle.find(filter)
      .sort({ publishedAt: -1 })
      .limit(parseInt(queryLimit) || 30);

    res.json({ count: articles.length, articles });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

module.exports = router;
