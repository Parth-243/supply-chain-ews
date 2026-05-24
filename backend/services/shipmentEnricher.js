/**
 * shipmentEnricher.js — Dynamic Shipment Enrichment Service
 *
 * Runs periodically to enrich static seeded shipments with real, live data:
 * 1. Live Weather severity at Origin and Destination ports
 * 2. Real Port Congestion at Origin and Destination ports
 * 3. Live News Sentiment mentioning port regions
 * 4. Local or ML-driven Risk Prediction to update riskScore, status, and delayHours
 */

const mongoose = require('mongoose');
const Shipment = mongoose.models.Shipment || require('../models/Shipment');
const { fetchAllPortWeather } = require('./weatherFetcher');
const { fetchAllPortCongestion } = require('./portCongestionFetcher');
const { generateAlertForEnrichedShipment } = require('./alertGenerator');

/**
 * Fetch average news sentiment score (-1 to 1) for a port over the last 7 days.
 */
async function getPortNewsSentimentScore(portName) {
  try {
    const NewsArticle = mongoose.models.NewsArticle || require('../models/NewsArticle');
    const articles = await NewsArticle.find({
      $or: [
        { headline: new RegExp(portName, 'i') },
        { 'entities.text': new RegExp(portName, 'i') },
        { region: new RegExp(portName, 'i') }
      ],
      publishedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    if (!articles || articles.length === 0) return 0.0; // neutral default

    const sum = articles.reduce((acc, a) => acc + (a.sentiment?.score || 0), 0);
    return sum / articles.length;
  } catch (err) {
    return 0.0;
  }
}

/**
 * Enrich all active shipments in the database with real-time data and ML risk scores.
 */
async function enrichAllShipments() {
  console.log('🔄 Starting dynamic shipment enrichment...');
  
  try {
    // 1. Fetch live weather and congestion mappings
    const weatherData = await fetchAllPortWeather();
    const congestionData = await fetchAllPortCongestion();

    const weatherMap = {};
    if (weatherData && weatherData.ports) {
      weatherData.ports.forEach(w => {
        weatherMap[w.port.toLowerCase()] = w.severity;
      });
    }

    const congestionMap = {};
    if (congestionData && congestionData.ports) {
      congestionData.ports.forEach(c => {
        congestionMap[c.port.toLowerCase()] = c;
      });
    }

    // 2. Fetch active shipments (not delivered or cancelled)
    const activeShipments = await Shipment.find({
      status: { $in: ['in_transit', 'delayed', 'at_risk'] }
    });

    console.log(`📦 Found ${activeShipments.length} active shipments to enrich.`);

    let enrichedCount = 0;
    const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

    for (const shipment of activeShipments) {
      try {
        const originName = (shipment.origin?.name || '').toLowerCase();
        const destName = (shipment.destination?.name || '').toLowerCase();

        // Retrieve real weather severity
        const originWeather = weatherMap[originName] || 0.15;
        const destWeather = weatherMap[destName] || 0.15;
        const maxWeather = Math.max(originWeather, destWeather);

        // Retrieve real port congestion level
        const originCongObj = congestionMap[originName];
        const destCongObj = congestionMap[destName];
        
        const originCongestion = originCongObj ? originCongObj.congestionLevel : 0.2;
        const destCongestion = destCongObj ? destCongObj.congestionLevel : 0.2;
        const maxCongestion = Math.max(originCongestion, destCongestion);

        // Retrieve news sentiment score
        const originSentiment = await getPortNewsSentimentScore(shipment.origin?.name || '');
        const destSentiment = await getPortNewsSentimentScore(shipment.destination?.name || '');
        const avgSentiment = (originSentiment + destSentiment) / 2;

        // Carrier reliability rating
        const carrier = (shipment.carrier || '').toLowerCase();
        let reliability = 0.85; // default
        if (carrier.includes('dhl')) reliability = 0.92;
        else if (carrier.includes('fedex')) reliability = 0.90;
        else if (carrier.includes('maersk')) reliability = 0.88;
        else if (carrier.includes('ups')) reliability = 0.91;

        // Base delays ratio based on current delay hours
        const delayRatio = Math.min(1.0, shipment.delayHours / 48);

        // Prepare request body for FastAPI ML service
        const mlPayload = {
          delay_ratio: delayRatio,
          port_congestion: maxCongestion,
          weather_severity: maxWeather,
          sentiment_score: avgSentiment,
          historical_reliability: reliability,
          volume_change: 0.02 * (Math.random() * 2 - 1), // small variance
          weather_risk: maxWeather * 100,
          historical_delay: shipment.delayHours || 12
        };

        let mlResult;
        try {
          // Attempt to query FastAPI ML service
          const response = await fetch(`${ML_URL}/predict/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mlPayload),
            signal: AbortSignal.timeout(4000)
          });

          if (response.ok) {
            mlResult = await response.json();
          } else {
            throw new Error(`ML status ${response.status}`);
          }
        } catch (err) {
          // Robust Local Fallback Scorer when ML microservice is offline
          const sentimentRisk = Math.max(0, Math.min(100, Math.round((1 - avgSentiment) * 50)));
          const weatherRisk = maxWeather * 100;
          const congestionRisk = maxCongestion * 100;
          
          // Weighted scoring
          const finalScore = Math.round(
            (0.3 * weatherRisk) + 
            (0.35 * congestionRisk) + 
            (0.2 * sentimentRisk) + 
            (0.15 * (1 - reliability) * 100)
          );

          mlResult = {
            risk_score: finalScore,
            risk_level: finalScore >= 80 ? 'critical' : finalScore >= 60 ? 'high' : finalScore >= 35 ? 'medium' : 'low',
            components: {
              weather_severity: maxWeather,
              port_congestion: maxCongestion,
              sentiment_score: avgSentiment
            }
          };
        }

        // 3. Update Shipment attributes
        shipment.riskScore = mlResult.risk_score;
        
        // Map risk to status and potential delays
        if (shipment.riskScore >= 75) {
          shipment.status = 'at_risk';
          shipment.delayHours = Math.max(shipment.delayHours, Math.round((shipment.riskScore - 60) * 0.6));
        } else if (shipment.riskScore >= 50) {
          shipment.status = 'delayed';
          shipment.delayHours = Math.max(shipment.delayHours, Math.round((shipment.riskScore - 40) * 0.4));
        } else {
          shipment.status = 'in_transit';
          shipment.delayHours = Math.max(0, shipment.delayHours - 2); // gradual recovery
        }

        // Build elegant list of risk factors
        shipment.riskFactors = [
          { factor: 'Severe Weather', weight: 0.3, score: Math.round(maxWeather * 100) },
          { factor: 'Port Congestion', weight: 0.4, score: Math.round(maxCongestion * 100) },
          { factor: 'Adverse News Sentiment', weight: 0.3, score: Math.round((1 - avgSentiment) * 50) }
        ];

        // Update route intermediate ports status
        if (shipment.route && shipment.route.length > 0) {
          shipment.route.forEach(routePort => {
            const portNameLower = routePort.port.toLowerCase();
            const matchingCongObj = congestionMap[portNameLower];
            if (matchingCongObj) {
              if (matchingCongObj.congestionLevel >= 0.75) {
                routePort.status = 'blocked';
              } else if (matchingCongObj.congestionLevel >= 0.5) {
                routePort.status = 'congested';
              } else {
                routePort.status = 'clear';
              }
            }
          });
        }

        await shipment.save();
        enrichedCount++;

        // 4. Generate system alerts for highly risky shipments
        if (shipment.riskScore >= 70) {
          await generateAlertForEnrichedShipment(shipment, maxWeather, maxCongestion);
        }

      } catch (innerErr) {
        console.error(`❌ Failed to enrich shipment ${shipment.shipmentId}:`, innerErr.message);
      }
    }

    console.log(`✅ Enrichment complete: ${enrichedCount} shipments updated.`);
    return { enrichedCount };
  } catch (err) {
    console.error('❌ Global enrichment service error:', err.message);
    return { enrichedCount: 0, error: err.message };
  }
}

module.exports = { enrichAllShipments };
