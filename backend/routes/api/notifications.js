const express = require('express');
const router = express.Router();

// In-memory notification preferences (in production, store in DB)
let notificationPrefs = {
  email: { enabled: false, address: '' },
  sms: { enabled: false, phone: '' },
  push: { enabled: false },
  alertThreshold: 80
};

// GET /api/notifications — get current preferences
router.get('/', (req, res) => {
  res.json(notificationPrefs);
});

// PUT /api/notifications — update preferences
router.put('/', (req, res) => {
  const { email, sms, push, alertThreshold } = req.body;
  if (email !== undefined) notificationPrefs.email = { ...notificationPrefs.email, ...email };
  if (sms !== undefined) notificationPrefs.sms = { ...notificationPrefs.sms, ...sms };
  if (push !== undefined) notificationPrefs.push = { ...notificationPrefs.push, ...push };
  if (alertThreshold !== undefined) notificationPrefs.alertThreshold = alertThreshold;

  res.json({ message: 'Preferences updated', preferences: notificationPrefs });
});

module.exports = router;
