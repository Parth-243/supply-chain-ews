const mongoose = require('mongoose');
const Alert = mongoose.models.Alert || require('../models/Alert');

/**
 * Generate a unique alert ID
 */
function generateAlertId(prefix = 'ALT') {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/**
 * Automatically creates/updates an alert for a shipment when enriched.
 */
async function generateAlertForEnrichedShipment(shipment, weatherSeverity, congestionLevel) {
  try {
    const riskScore = shipment.riskScore;
    if (riskScore < 70) return null; // Only create alerts for high/critical risks

    const severity = riskScore >= 85 ? 'critical' : 'high';
    
    // Determine primary risk factor
    let type = 'anomaly';
    if (weatherSeverity >= 0.6) type = 'weather';
    else if (congestionLevel >= 0.6) type = 'congestion';
    else if (shipment.delayHours > 24) type = 'congestion';

    // De-duplicate: look for active alerts on the same route with same type within last 12 hours
    const existingAlert = await Alert.findOne({
      'affectedRoute.from': shipment.origin.name,
      'affectedRoute.to': shipment.destination.name,
      type,
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 12 * 60 * 60 * 1000) }
    });

    if (existingAlert) {
      // Add shipmentId to existing alert if not already present
      if (!existingAlert.shipmentIds.includes(shipment.shipmentId)) {
        existingAlert.shipmentIds.push(shipment.shipmentId);
        // Update riskScore to the maximum
        existingAlert.riskScore = Math.max(existingAlert.riskScore, riskScore);
        await existingAlert.save();
      }
      return existingAlert;
    }

    // Prepare mitigation strategy suggestions
    let suggestion = '';
    let alternativeRoutes = [];
    
    if (type === 'weather') {
      suggestion = `Severe weather alert near ${shipment.origin.name} or ${shipment.destination.name}. Advise carrier ${shipment.carrier} to delay departure or route via safer waters.`;
      alternativeRoutes = [`${shipment.origin.name} → Dubai → ${shipment.destination.name}`];
    } else if (type === 'congestion') {
      suggestion = `High port congestion detected at intermediate routes. Reschedule arrivals or reroute to secondary terminals.`;
      alternativeRoutes = [`${shipment.origin.name} → Rotterdam → ${shipment.destination.name}`];
    } else {
      suggestion = `Disruption anomaly detected. Perform immediate cargo checks with carrier ${shipment.carrier}.`;
      alternativeRoutes = [`${shipment.origin.name} → Singapore → ${shipment.destination.name}`];
    }

    const alert = await Alert.create({
      alertId: generateAlertId('ALT'),
      severity,
      type,
      title: `${severity.toUpperCase()} Disruption Risk: ${shipment.origin.name} → ${shipment.destination.name}`,
      description: `Elevated risk score of ${riskScore}% calculated by machine learning for shipment ${shipment.shipmentId}. Major risk triggers: weather severity (${Math.round(weatherSeverity * 100)}%), port congestion (${Math.round(congestionLevel * 100)}%).`,
      affectedRoute: {
        from: shipment.origin.name,
        to: shipment.destination.name,
        region: shipment.origin.country
      },
      riskScore,
      shipmentIds: [shipment.shipmentId],
      mitigation: {
        suggestion,
        alternativeRoutes,
        estimatedCostImpact: Math.round(riskScore * 350),
        status: 'pending'
      },
      isActive: true
    });

    console.log(`⚠️  [ALERT GENERATED] Created ${severity} alert ${alert.alertId} for shipment ${shipment.shipmentId}`);
    return alert;
  } catch (err) {
    console.error('❌ Failed to generate alert for shipment:', err.message);
    return null;
  }
}

/**
 * Periodically auto-resolves stale alerts (e.g. older than 48 hours)
 */
async function autoResolveStaleAlerts() {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const result = await Alert.updateMany(
      { isActive: true, createdAt: { $lt: cutoff } },
      { $set: { isActive: false, resolvedAt: new Date(), 'mitigation.status': 'resolved' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`🧹  [ALERT CLEANUP] Auto-resolved ${result.modifiedCount} stale alerts older than 48 hours.`);
    }
  } catch (err) {
    console.error('❌ Error during alert auto-resolve:', err.message);
  }
}

module.exports = {
  generateAlertForEnrichedShipment,
  autoResolveStaleAlerts
};
