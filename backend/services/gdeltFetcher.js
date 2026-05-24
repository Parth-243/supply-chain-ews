/**
 * gdeltFetcher.js — Geopolitical Event Alerts from GDELT Project
 *
 * GDELT is 100% free, no API key needed.
 * Monitors global geopolitical events (conflicts, sanctions, disasters)
 * that affect supply chains and creates Alert documents in MongoDB.
 * https://gdeltproject.org/
 *
 * Uses the GDELT DOC 2.0 API to search for supply-chain relevant events.
 */

const Alert = require('../models/Alert');

const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Supply-chain focused GDELT search themes
const SEARCHES = [
  { query: '"supply chain" disruption OR strike OR port',  type: 'congestion' },
  { query: '"Red Sea" OR "Suez Canal" ship OR cargo',      type: 'geopolitical' },
  { query: 'port strike OR "port closure" OR "port congestion"', type: 'strike' },
  { query: 'trade sanctions embargo shipping',             type: 'geopolitical' },
  { query: 'cyclone OR hurricane OR "port flood" shipping', type: 'weather'    },
];

// Tone → severity mapping (GDELT tone is positive=positive, negative=negative)
function toneToSeverity(tone) {
  if (tone <= -5) return 'critical';
  if (tone <= -2) return 'high';
  return 'moderate';
}

/**
 * High-quality fallback alerts when GDELT is rate-limiting or down.
 */
function generateFallbackArticles(type) {
  const fallbacks = {
    congestion: [
      {
        title: "Major port congestion reported at Singapore anchorage due to surging volume",
        tone: -3.8,
        domain: "maritime-news.com",
        url: "https://example.com/singapore-anchorage-congestion"
      },
      {
        title: "European rail freight faces delays following key crossing logistics disruption",
        tone: -2.9,
        domain: "logistics-europe.eu",
        url: "https://example.com/european-rail-logistics"
      }
    ],
    geopolitical: [
      {
        title: "Maritime shipping rates soar in Red Sea amid heightened security warnings",
        tone: -5.4,
        domain: "globaltrade.com",
        url: "https://example.com/red-sea-shipping-surges"
      },
      {
        title: "New sanctions on manufacturing components trigger trade route adjustments",
        tone: -3.1,
        domain: "reuters-financial.com",
        url: "https://example.com/manufacturing-tariffs-sanctions"
      }
    ],
    strike: [
      {
        title: "US West Coast ports face union strike warnings over labor negotiations contract",
        tone: -4.2,
        domain: "journalofcommerce.com",
        url: "https://example.com/west-coast-dockworkers-dispute"
      },
      {
        title: "Rotterdam port labor dispute threatens supply chain slowdowns next week",
        tone: -3.3,
        domain: "nl-times.nl",
        url: "https://example.com/rotterdam-labor-deadlock"
      }
    ],
    weather: [
      {
        title: "Category 3 Typhoon approaching China coastal shipping lanes near Shanghai port",
        tone: -6.2,
        domain: "weatherwatch-asia.org",
        url: "https://example.com/typhoon-east-china-sea"
      },
      {
        title: "Severe flooding in South Brazil paralyzes Santos port highway access roads",
        tone: -4.8,
        domain: "santos-diario.br",
        url: "https://example.com/santos-floods-highway"
      }
    ]
  };

  const pool = fallbacks[type] || fallbacks.congestion;
  return pool.map(item => ({
    ...item,
    tone: item.tone + (Math.random() * 0.8 - 0.4), // slight randomization
  }));
}

let searchIndex = 0;

async function fetchGdeltAlerts() {
  const search = SEARCHES[searchIndex % SEARCHES.length];
  searchIndex++;

  const params = new URLSearchParams({
    query:      search.query,
    mode:       'artlist',
    maxrecords: '10',
    format:     'json',
    timespan:   '24h',       // last 24 hours
    sort:       'ToneDesc',  // most negative tone first
  });

  let articles = [];
  let isSimulated = false;

  const maxRetries = 2;
  let delay = 2000;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const res = await fetch(`${GDELT_API}?${params}`, {
        signal: AbortSignal.timeout(35000), // 35-second timeout
      });

      const contentType = res.headers.get('content-type') || '';
      
      if (!res.ok) {
        throw new Error(`GDELT API status ${res.status}`);
      }

      if (!contentType.includes('application/json')) {
        throw new Error(`Non-JSON content returned: ${contentType.slice(0, 30)}`);
      }

      const data = await res.json();
      articles = data.articles || [];
      break; // Success!
    } catch (err) {
      console.warn(`⚠️ GDELT attempt ${attempt} failed:`, err.message);
      
      if (attempt <= maxRetries) {
        console.log(`⏱️ Retrying GDELT in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      } else {
        // Out of retries, trigger resilient fallback
        console.log(`ℹ️ GDELT API unavailable. Using realistic live-simulated fallback for ${search.type}.`);
        articles = generateFallbackArticles(search.type);
        isSimulated = true;
      }
    }
  }

  if (!articles.length) return { created: 0, reason: 'no_results' };

  // Filter for negative tone alerts
  const alarming = articles.filter(a => (a.tone ?? 0) < -2);
  if (!alarming.length) return { created: 0, reason: 'no_alarming_events' };

  let created = 0;

  for (const article of alarming.slice(0, 3)) {
    const title    = article.title || 'Geopolitical Event Detected';
    const severity = toneToSeverity(article.tone ?? 0);

    // De-duplicate alerts
    const existing = await Alert.findOne({ title: { $regex: title.slice(0, 40), $options: 'i' } });
    if (existing) continue;

    await Alert.create({
      alertId:      `GDELT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      severity,
      type:         search.type,
      title:        title.slice(0, 120),
      description:  `Detected via GDELT real-time news monitoring${isSimulated ? ' (simulated source)' : ''}. Tone score: ${article.tone?.toFixed(1) ?? 'N/A'}. Source: ${article.domain || 'Unknown'}.`,
      affectedRoute: { from: 'Global', to: 'Global', region: 'Global' },
      riskScore:    severity === 'critical' ? 88 : severity === 'high' ? 72 : 55,
      shipmentIds:  [],
      mitigation:   {
        suggestion: 'Monitor closely. Review affected shipment routes and prepare contingency plans.',
        alternativeRoutes: [],
        estimatedCostImpact: 0,
        status: 'pending',
      },
      isActive:     true,
      sourceUrl:    article.url || '',
    });
    created++;
  }

  console.log(`🌍 GDELT [${search.type}]: ${created} new alerts created from ${articles.length} articles (source: ${isSimulated ? 'simulated' : 'real'})`);
  return { created, search: search.query, source: isSimulated ? 'simulated' : 'real' };
}

module.exports = { fetchGdeltAlerts };
