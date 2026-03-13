'use client';

import { useEffect, useState, useCallback } from 'react';
import DisruptionGauge from '@/components/DisruptionGauge';
import CriticalAlerts from '@/components/CriticalAlerts';
import PredictiveConfidence from '@/components/PredictiveConfidence';
import RiskHeatmap from '@/components/RiskHeatmap';
import SentimentFeed from '@/components/SentimentFeed';
import SystemHealth from '@/components/SystemHealth';
import MitigationSuggestions from '@/components/MitigationSuggestions';
import { api } from '@/lib/api';

// Fallback demo data when backend is not connected
const DEMO_DATA = {
  disruptionIndex: 67,
  predictiveConfidence: 78,
  activeAlerts: {
    count: 4,
    items: [
      { alertId: 'ALT-0001', severity: 'critical', title: 'CRITICAL Risk: Shanghai → Rotterdam', description: 'Risk score of 92 detected.', riskScore: 92, type: 'congestion', mitigation: { suggestion: 'Severe congestion at Shanghai port. Consider rerouting via Singapore or delaying shipment by 24-48 hours.', status: 'pending' } },
      { alertId: 'ALT-0002', severity: 'critical', title: 'CRITICAL Risk: Mumbai → Hamburg', description: 'Risk score of 88 detected.', riskScore: 88, type: 'weather', mitigation: { suggestion: 'Cyclone warning in Bay of Bengal. Recommend holding shipment until weather clears in 48-72 hours.', status: 'pending' } },
      { alertId: 'ALT-0003', severity: 'high', title: 'HIGH Risk: Santos → Felixstowe', description: 'Risk score of 76 detected.', riskScore: 76, type: 'strike', mitigation: { suggestion: 'Port worker strike announced at Santos. Activate backup carrier and pre-position inventory.', status: 'pending' } },
      { alertId: 'ALT-0004', severity: 'high', title: 'HIGH Risk: Busan → Los Angeles', description: 'Risk score of 72 detected.', riskScore: 72, type: 'geopolitical', mitigation: { suggestion: 'New trade tariffs may cause delays. Monitor situation and prepare alternative customs routes.', status: 'pending' } },
    ]
  },
  sentimentFeed: [
    { headline: 'Port of Shanghai reports record congestion levels amid surge in exports', publishedAt: new Date(Date.now() - 3600000).toISOString(), sentiment: { score: -0.6, label: 'negative' as const, confidence: 0.8 }, entities: [{ text: 'Shanghai', type: 'port' }, { text: 'China', type: 'location' }], source: 'Reuters', category: 'logistics' },
    { headline: 'Tropical cyclone warning issued for Bay of Bengal shipping lanes', publishedAt: new Date(Date.now() - 7200000).toISOString(), sentiment: { score: -0.8, label: 'negative' as const, confidence: 0.9 }, entities: [{ text: 'Bay of Bengal', type: 'location' }, { text: 'Cyclone', type: 'event' }], source: 'Bloomberg', category: 'weather' },
    { headline: 'Dock workers in Rotterdam announce 48-hour strike over pay dispute', publishedAt: new Date(Date.now() - 10800000).toISOString(), sentiment: { score: -0.9, label: 'negative' as const, confidence: 0.95 }, entities: [{ text: 'Rotterdam', type: 'port' }, { text: 'Strike', type: 'event' }], source: 'Financial Times', category: 'labor' },
    { headline: 'Suez Canal reopens after brief blockage, backlog expected to clear', publishedAt: new Date(Date.now() - 14400000).toISOString(), sentiment: { score: 0.3, label: 'positive' as const, confidence: 0.6 }, entities: [{ text: 'Suez Canal', type: 'port' }, { text: 'Egypt', type: 'location' }], source: 'Lloyd\'s List', category: 'logistics' },
    { headline: 'Mediterranean shipping rates fall 15% as new capacity enters market', publishedAt: new Date(Date.now() - 18000000).toISOString(), sentiment: { score: 0.5, label: 'positive' as const, confidence: 0.7 }, entities: [{ text: 'Mediterranean', type: 'location' }], source: 'FreightWaves', category: 'economic' },
    { headline: 'US-China trade tensions escalate with new tariffs on semiconductors', publishedAt: new Date(Date.now() - 21600000).toISOString(), sentiment: { score: -0.7, label: 'negative' as const, confidence: 0.85 }, entities: [{ text: 'US', type: 'location' }, { text: 'China', type: 'location' }, { text: 'Semiconductors', type: 'commodity' }], source: 'Reuters', category: 'geopolitical' },
    { headline: 'Port of Singapore achieves record throughput with automated systems', publishedAt: new Date(Date.now() - 25200000).toISOString(), sentiment: { score: 0.8, label: 'positive' as const, confidence: 0.9 }, entities: [{ text: 'Singapore', type: 'port' }], source: 'Bloomberg', category: 'logistics' },
    { headline: 'Red Sea tensions force major carriers to reroute via Cape of Good Hope', publishedAt: new Date(Date.now() - 28800000).toISOString(), sentiment: { score: -0.85, label: 'negative' as const, confidence: 0.92 }, entities: [{ text: 'Red Sea', type: 'location' }, { text: 'Houthi', type: 'organization' }], source: 'Financial Times', category: 'geopolitical' },
    { headline: 'Global container shortage eases as manufacturers ramp up production', publishedAt: new Date(Date.now() - 32400000).toISOString(), sentiment: { score: 0.6, label: 'positive' as const, confidence: 0.75 }, entities: [{ text: 'Container Shortage', type: 'event' }], source: 'FreightWaves', category: 'logistics' },
    { headline: 'Panama Canal restricts transit due to historic drought conditions', publishedAt: new Date(Date.now() - 36000000).toISOString(), sentiment: { score: -0.75, label: 'negative' as const, confidence: 0.88 }, entities: [{ text: 'Panama Canal', type: 'port' }, { text: 'Drought', type: 'event' }], source: 'The Maritime Executive', category: 'weather' },
  ],
  heatmapData: [
    { lat: 31.23, lng: 121.47, name: 'Shanghai', avgRisk: 85, intensity: 0.85, count: 12 },
    { lat: 1.35, lng: 103.82, name: 'Singapore', avgRisk: 35, intensity: 0.35, count: 8 },
    { lat: 51.92, lng: 4.48, name: 'Rotterdam', avgRisk: 72, intensity: 0.72, count: 6 },
    { lat: 33.74, lng: -118.27, name: 'Los Angeles', avgRisk: 42, intensity: 0.42, count: 5 },
    { lat: 25.04, lng: 55.11, name: 'Dubai', avgRisk: 28, intensity: 0.28, count: 4 },
    { lat: 53.55, lng: 9.99, name: 'Hamburg', avgRisk: 55, intensity: 0.55, count: 3 },
    { lat: 35.18, lng: 129.08, name: 'Busan', avgRisk: 48, intensity: 0.48, count: 7 },
    { lat: 18.95, lng: 72.95, name: 'Mumbai', avgRisk: 78, intensity: 0.78, count: 5 },
    { lat: -23.96, lng: -46.33, name: 'Santos', avgRisk: 65, intensity: 0.65, count: 3 },
    { lat: -4.04, lng: 39.67, name: 'Mombasa', avgRisk: 32, intensity: 0.32, count: 2 },
    { lat: 31.26, lng: 32.28, name: 'Port Said', avgRisk: 58, intensity: 0.58, count: 4 },
    { lat: 35.44, lng: 139.64, name: 'Yokohama', avgRisk: 38, intensity: 0.38, count: 5 },
    { lat: 51.95, lng: 1.35, name: 'Felixstowe', avgRisk: 45, intensity: 0.45, count: 3 },
    { lat: 37.95, lng: 23.64, name: 'Piraeus', avgRisk: 52, intensity: 0.52, count: 2 },
    { lat: 6.95, lng: 79.84, name: 'Colombo', avgRisk: 40, intensity: 0.40, count: 3 },
  ],
  systemHealth: { apiLatency: 45.2, uptime: 86400 },
  mlServiceStatus: 'connected'
};

export default function DashboardPage() {
  const [data, setData] = useState(DEMO_DATA);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashboardRes, heatmapRes] = await Promise.all([
        api.getDashboard(),
        api.getHeatmapData()
      ]);
      setData({
        ...dashboardRes,
        heatmapData: heatmapRes,
        mlServiceStatus: dashboardRes.systemHealth?.mlServiceStatus || 'unknown'
      });
    } catch {
      console.log('Using demo data — backend not connected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      await api.alertAction(alertId, action);
      fetchDashboard();
    } catch {
      setData(prev => ({
        ...prev,
        activeAlerts: {
          ...prev.activeAlerts,
          items: prev.activeAlerts.items.filter(a => a.alertId !== alertId),
          count: prev.activeAlerts.count - 1,
        }
      }));
    }
  };

  return (
    <div className="dashboard-body" style={{ opacity: loading ? 0.7 : 1, transition: 'opacity 0.3s' }}>
      {/* ===== LEFT: Main Column ===== */}
      <div className="dashboard-main">
        {/* Top Row: 3-column grid */}
        <div className="top-row">
          <DisruptionGauge score={data.disruptionIndex} />
          <CriticalAlerts alerts={data.activeAlerts?.items || []} onAction={handleAlertAction} />
          <PredictiveConfidence confidence={data.predictiveConfidence} />
        </div>

        {/* Central Feature: Heatmap */}
        <div className="map-area">
          <RiskHeatmap data={data.heatmapData || []} />
        </div>
      </div>

      {/* ===== RIGHT: Sidebar Column ===== */}
      <div className="dashboard-aside">
        <SentimentFeed articles={data.sentimentFeed || []} />
        <MitigationSuggestions alerts={data.activeAlerts?.items || []} onAction={handleAlertAction} />
        <SystemHealth
          apiLatency={data.systemHealth?.apiLatency || 0}
          ingestionRate={35}
          mlStatus={data.mlServiceStatus || 'disconnected'}
          uptime={data.systemHealth?.uptime || 0}
        />
      </div>
    </div>
  );
}
