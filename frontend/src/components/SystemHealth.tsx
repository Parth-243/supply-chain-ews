'use client';

interface SystemHealthProps {
  apiLatency?: number;
  ingestionRate?: number;
  mlStatus?: string;
  uptime?: number;
}

export default function SystemHealth({ apiLatency = 0, ingestionRate = 0, mlStatus = 'unknown', uptime = 0 }: SystemHealthProps) {
  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">💓 System Health Logs</span>
        <span style={{
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 4,
          background: mlStatus === 'connected' ? 'var(--success-soft)' : 'var(--warning-soft)',
          color: mlStatus === 'connected' ? 'var(--success)' : 'var(--warning)',
          fontWeight: 600
        }}>
          ML Service: {mlStatus}
        </span>
      </div>
      <div className="card-body">
        <div className="health-metric">
          <div className="health-metric-header">
            <span className="health-metric-label">Real-Time API Latency</span>
            <span className="health-metric-value">{apiLatency.toFixed(1)} ms</span>
          </div>
          <div className="health-bar">
            <div className="health-bar-fill" style={{
              width: `${Math.min(100, (apiLatency / 200) * 100)}%`,
              background: apiLatency > 150 ? 'var(--danger)' : apiLatency > 80 ? 'var(--warning)' : undefined
            }} />
          </div>
        </div>

        <div className="health-metric">
          <div className="health-metric-header">
            <span className="health-metric-label">MongoDB Ingestion Rate</span>
            <span className="health-metric-value">{ingestionRate} docs/min</span>
          </div>
          <div className="health-bar">
            <div className="health-bar-fill" style={{ width: `${Math.min(100, (ingestionRate / 100) * 100)}%` }} />
          </div>
        </div>

        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
          Uptime: {formatUptime(uptime)}
        </div>
      </div>
    </div>
  );
}
