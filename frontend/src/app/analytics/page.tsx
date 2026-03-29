'use client';

import {
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, ZAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Cell,
} from 'recharts';

// ── Demo data ──────────────────────────────────────────────
const riskDistribution = [
  { range: '0–10', count: 2 },
  { range: '10–20', count: 5 },
  { range: '20–30', count: 8 },
  { range: '30–40', count: 14 },
  { range: '40–50', count: 21 },
  { range: '50–60', count: 18 },
  { range: '60–70', count: 13 },
  { range: '70–80', count: 9 },
  { range: '80–90', count: 6 },
  { range: '90–100', count: 4 },
];

const carrierReliability = [
  { carrier: 'Maersk', onTime: 82, safetyScore: 90, capacity: 75, costEfficiency: 68, riskProfile: 25 },
  { carrier: 'MSC', onTime: 74, safetyScore: 78, capacity: 88, costEfficiency: 80, riskProfile: 40 },
  { carrier: 'CMA CGM', onTime: 79, safetyScore: 85, capacity: 70, costEfficiency: 72, riskProfile: 32 },
  { carrier: 'COSCO', onTime: 68, safetyScore: 72, capacity: 92, costEfficiency: 88, riskProfile: 55 },
  { carrier: 'Evergreen', onTime: 76, safetyScore: 80, capacity: 65, costEfficiency: 74, riskProfile: 38 },
];

const scatterData = Array.from({ length: 30 }, (_, i) => {
  const predicted = Math.floor(Math.random() * 100);
  const actual = Math.min(100, Math.max(0, predicted + (Math.random() * 30 - 14)));
  return { predicted: Math.round(predicted), actual: Math.round(actual), volume: Math.round(Math.random() * 100 + 10) };
});

const regionalData = [
  { region: 'Asia Pacific', avgRisk: 72, alertCount: 38, routeCount: 42 },
  { region: 'Europe', avgRisk: 48, alertCount: 19, routeCount: 28 },
  { region: 'N. America', avgRisk: 35, alertCount: 12, routeCount: 22 },
  { region: 'Middle East', avgRisk: 81, alertCount: 45, routeCount: 15 },
  { region: 'Africa', avgRisk: 65, alertCount: 27, routeCount: 11 },
  { region: 'S. America', avgRisk: 53, alertCount: 21, routeCount: 18 },
];

const RISK_COLORS = ['#10b981', '#10b981', '#10b981', '#3b82f6', '#3b82f6', '#f59e0b', '#f59e0b', '#ef4444', '#ef4444', '#ef4444'];

const radarData = ['onTime', 'safetyScore', 'capacity', 'costEfficiency', 'riskProfile'].map(key => ({
  metric: key === 'onTime' ? 'On-Time' : key === 'safetyScore' ? 'Safety' : key === 'capacity' ? 'Capacity' : key === 'costEfficiency' ? 'Cost Eff.' : 'Risk',
  Maersk: carrierReliability[0][key as keyof typeof carrierReliability[0]] as number,
  MSC: carrierReliability[1][key as keyof typeof carrierReliability[1]] as number,
  'CMA CGM': carrierReliability[2][key as keyof typeof carrierReliability[2]] as number,
}));

const ChartTooltipStyle = {
  backgroundColor: '#1a1f35',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8,
  fontSize: 12,
  color: '#f0f4ff',
};

// ─────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20 }}>📈 Analytics</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['7D', '30D', '90D', '1Y'].map(r => (
            <button key={r} className={`btn btn-ghost ${r === '30D' ? 'active' : ''}`} style={{ fontSize: 11, padding: '4px 10px', color: r === '30D' ? 'var(--accent-cyan)' : undefined, borderColor: r === '30D' ? 'var(--accent-cyan)' : undefined }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Risk Distribution + Carrier Reliability Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Risk Distribution Histogram */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📊 Risk Score Distribution</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>All routes</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={riskDistribution} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ChartTooltipStyle} formatter={(v: number) => [v, 'Routes']} />
                <Bar dataKey="count" name="Routes" radius={[4, 4, 0, 0]}>
                  {riskDistribution.map((_, i) => (
                    <Cell key={i} fill={RISK_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              {[['Low (0–40)', '#10b981'], ['Medium (40–70)', '#3b82f6'], ['High (70–100)', '#ef4444']].map(([label, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: color as string, display: 'inline-block' }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carrier Reliability Radar */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🛳 Carrier Reliability</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top 3 carriers</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#8b95b0' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#5a6480' }} />
                <Radar name="Maersk" dataKey="Maersk" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.12} strokeWidth={2} dot={{ r: 3 }} />
                <Radar name="MSC" dataKey="MSC" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={2} dot={{ r: 3 }} />
                <Radar name="CMA CGM" dataKey="CMA CGM" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={2} dot={{ r: 3 }} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8b95b0' }} />
                <Tooltip contentStyle={ChartTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Scatter Plot + Regional Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Delay vs Prediction Scatter */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🎯 Predicted vs Actual Delay</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scatter analysis</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={230}>
              <ScatterChart margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="predicted" name="Predicted" label={{ value: 'Predicted', position: 'insideBottom', offset: -4, fill: '#5a6480', fontSize: 11 }} tick={{ fontSize: 10, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="actual" name="Actual" label={{ value: 'Actual', angle: -90, position: 'insideLeft', fill: '#5a6480', fontSize: 11 }} tick={{ fontSize: 10, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <ZAxis dataKey="volume" range={[30, 100]} />
                <Tooltip contentStyle={ChartTooltipStyle} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }} formatter={(v: number, name: string) => [v, name]} />
                <Scatter data={scatterData} fill="#00d4ff" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Comparison */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🌍 Regional Risk Comparison</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>By geography</span>
          </div>
          <div className="card-body" style={{ padding: '12px 16px' }}>
            {regionalData.map(r => {
              const color = r.avgRisk >= 70 ? 'var(--danger)' : r.avgRisk >= 50 ? 'var(--warning)' : 'var(--success)';
              return (
                <div key={r.region} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                    <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{r.region}</span>
                    <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>{r.routeCount} routes</span>
                      <span style={{ color }}>{r.alertCount} alerts</span>
                      <span style={{ color, fontWeight: 700 }}>{r.avgRisk}</span>
                    </div>
                  </div>
                  <div className="health-bar">
                    <div style={{ height: '100%', borderRadius: 3, width: `${r.avgRisk}%`, background: color, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
