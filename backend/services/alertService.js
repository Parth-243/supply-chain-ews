const Alert = require('../models/Alert');
const { v4: uuidv4 } = require('uuid');

/**
 * Auto-generates critical alerts when risk score exceeds threshold (>80)
 */
const CRITICAL_THRESHOLD = 80;

const alertService = {
  async checkAndCreateAlert(shipment, riskScore) {
    if (riskScore.overallScore >= CRITICAL_THRESHOLD) {
      const existingAlert = await Alert.findOne({
        'affectedRoute.from': shipment.origin.name,
        'affectedRoute.to': shipment.destination.name,
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 3600000) } // within last hour
      });

      if (!existingAlert) {
        const severity = riskScore.overallScore >= 90 ? 'critical' : 'high';
        const alertType = this.determineAlertType(riskScore);

        const alert = new Alert({
          alertId: `ALT-${uuidv4().slice(0, 8).toUpperCase()}`,
          severity,
          type: alertType,
          title: `${severity.toUpperCase()} Risk: ${shipment.origin.name} → ${shipment.destination.name}`,
          description: `Risk score of ${riskScore.overallScore} detected on route. Primary factor: ${alertType}.`,
          affectedRoute: {
            from: shipment.origin.name,
            to: shipment.destination.name,
            region: shipment.origin.country
          },
          riskScore: riskScore.overallScore,
          shipmentIds: [shipment.shipmentId],
          mitigation: {
            suggestion: this.generateMitigation(alertType, shipment),
            alternativeRoutes: this.getAlternativeRoutes(shipment),
            estimatedCostImpact: Math.round(riskScore.overallScore * 500),
            status: 'pending'
          }
        });

        return await alert.save();
      }
    }
    return null;
  },

  determineAlertType(riskScore) {
    const { anomalyScore, sentimentRisk, weatherRisk } = riskScore.components;
    const max = Math.max(anomalyScore || 0, sentimentRisk || 0, weatherRisk || 0);
    if (max === weatherRisk) return 'weather';
    if (max === sentimentRisk) return 'geopolitical';
    return 'anomaly';
  },

  generateMitigation(type, shipment) {
    const mitigations = {
      weather: `Severe weather alert on ${shipment.origin.name} → ${shipment.destination.name} route. Consider delaying shipment by 24-48 hours or rerouting via alternative port.`,
      geopolitical: `Geopolitical instability detected near ${shipment.origin.country}. Recommend activating backup suppliers in alternative regions.`,
      congestion: `Port congestion at ${shipment.destination.name}. Suggest rerouting to nearby port or scheduling off-peak delivery.`,
      strike: `Labor disruption reported. Pre-position inventory and activate contingency carriers.`,
      anomaly: `Unusual pattern detected on this route. Monitor closely and prepare contingency plans.`
    };
    return mitigations[type] || mitigations.anomaly;
  },

  getAlternativeRoutes(shipment) {
    // Simplified: return placeholder alternatives
    return [
      `${shipment.origin.name} → Singapore → ${shipment.destination.name}`,
      `${shipment.origin.name} → Dubai → ${shipment.destination.name}`
    ];
  }
};

module.exports = alertService;
