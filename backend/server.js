require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Latency tracking middleware
const latencyTracker = require('./middleware/latencyTracker');
app.use(latencyTracker);

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/dashboard', require('./routes/api/dashboard'));
app.use('/api/alerts', require('./routes/api/alerts'));
app.use('/api/shipments', require('./routes/api/shipments'));
app.use('/api/whatif', require('./routes/api/whatif'));
app.use('/api/health', require('./routes/api/health'));
app.use('/api/notifications', require('./routes/api/notifications'));
app.use('/api/news', require('./routes/api/news'));
app.use('/api/model', require('./routes/api/model'));

// Health check
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
});

module.exports = app;
