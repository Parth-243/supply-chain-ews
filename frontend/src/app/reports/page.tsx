'use client';

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ── Demo data ──────────────────────────────────────────────
const weeklyTrend = [
  { week: 'Feb W1', riskScore: 48, disruptions: 3 },
  { week: 'Feb W2', riskScore: 62, disruptions: 5 },
  { week: 'Feb W3', riskScore: 55, disruptions: 4 },
  { week: 'Feb W4', riskScore: 71, disruptions: 7 },
  { week: 'Mar W1', riskScore: 58, disruptions: 4 },
  { week: 'Mar W2', riskScore: 83, disruptions: 9 },
  { week: 'Mar W3', riskScore: 74, disruptions: 6 },
  { week: 'Mar W4', riskScore: 67, disruptions: 5 },
];

const topRoutes = [
  { route: 'Shanghai → LA', riskScore: 88 },
  { route: 'Rotterdam → NYC', riskScore: 74 },
  { route: 'Singapore → Hamburg', riskScore: 69 },
  { route: 'Dubai → Mumbai', riskScore: 61 },
  { route: 'Tokyo → Seattle', riskScore: 54 },
];

const alertFrequency = [
  { month: 'Oct', critical: 4, high: 9, medium: 14 },
  { month: 'Nov', critical: 6, high: 11, medium: 17 },
  { month: 'Dec', critical: 3, high: 7, medium: 12 },
  { month: 'Jan', critical: 8, high: 13, medium: 20 },
  { month: 'Feb', critical: 5, high: 10, medium: 18 },
  { month: 'Mar', critical: 11, high: 15, medium: 22 },
];

const summaryStats = [
  { label: 'Avg Monthly Alerts', value: '46', change: '+12%', up: true },
  { label: 'Critical Incidents', value: '37', change: '+8%', up: true },
  { label: 'Routes Monitored', value: '124', change: '+5', up: true },
  { label: 'Avg Risk Score', value: '65', change: '-3pts', up: false },
];

// ── Custom tooltip ─────────────────────────────────────────
const ChartTooltipStyle = {
  backgroundColor: '#1a1f35',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 8,
  fontSize: 12,
  color: '#f0f4ff',
};

// ─────────────────────────────────────────────────────────────
export default function ReportsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 20 }}>📄 Reports</h2>
        <button className="btn btn-primary" style={{ fontSize: 12, padding: '7px 16px' }}>
          ⬇ Export PDF
        </button>
      </div>

      {/* Summary Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
        {summaryStats.map(s => (
          <div key={s.label} className="card">
            <div className="card-body" style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{s.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, background: 'linear-gradient(135deg,var(--accent-cyan),var(--accent-blue))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</span>
                <span style={{ fontSize: 11, color: s.up ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{s.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Risk Trend */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">📈 Weekly Risk Trend</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 8 weeks</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="disruptionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#5a6480' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#5a6480' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: '#8b95b0' }} />
              <Area type="monotone" dataKey="riskScore" name="Risk Score" stroke="#00d4ff" strokeWidth={2} fill="url(#riskGradient)" dot={{ r: 3, fill: '#00d4ff' }} />
              <Area type="monotone" dataKey="disruptions" name="Disruptions" stroke="#ef4444" strokeWidth={2} fill="url(#disruptionGradient)" dot={{ r: 3, fill: '#ef4444' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Top Routes + Alert Frequency */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top 5 At-Risk Routes */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🚢 Top 5 At-Risk Routes</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Current period</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRoutes} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="route" type="category" tick={{ fontSize: 11, fill: '#8b95b0' }} axisLine={false} tickLine={false} width={130} />
                <Tooltip contentStyle={ChartTooltipStyle} formatter={(v: number) => [`${v}`, 'Risk Score']} />
                <Bar dataKey="riskScore" name="Risk Score" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert Frequency */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🔔 Alert Frequency</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 6 months</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={alertFrequency} margin={{ top: 4, right: 16, left: -8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#5a6480' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ChartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#8b95b0' }} />
                <Bar dataKey="critical" name="Critical" stackId="a" fill="#ef4444" />
                <Bar dataKey="high" name="High" stackId="a" fill="#f59e0b" />
                <Bar dataKey="medium" name="Medium" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
