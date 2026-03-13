// Middleware to track API response latency
const latencyData = { samples: [], average: 0 };

const latencyTracker = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    latencyData.samples.push({ timestamp: new Date(), duration, path: req.path });

    // Keep last 100 samples
    if (latencyData.samples.length > 100) {
      latencyData.samples.shift();
    }

    // Recalculate average
    latencyData.average = latencyData.samples.reduce((sum, s) => sum + s.duration, 0) / latencyData.samples.length;
  });

  next();
};

latencyTracker.getLatencyData = () => latencyData;

module.exports = latencyTracker;
