'use client';

interface Alert {
  alertId: string;
  severity: string;
  title: string;
  description: string;
  riskScore: number;
  type: string;
  mitigation: {
    suggestion: string;
    status: string;
  };
}

interface CriticalAlertsProps {
  alerts: Alert[];
  onAction?: (alertId: string, action: string) => void;
}

export default function CriticalAlerts({ alerts = [], onAction }: CriticalAlertsProps) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">
          🚨 Active Critical Alerts
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>{alerts.length}</span>
        </span>
      </div>
      <div className="card-body" style={{ maxHeight: 300, overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No active alerts</p>
        ) : (
          alerts.slice(0, 5).map(alert => (
            <div key={alert.alertId} className={`alert-card ${alert.severity === 'high' ? 'high' : ''}`}>
              <div className="alert-card-title">
                {alert.severity === 'critical' ? '🔴' : '🟠'} {alert.title}
              </div>
              <div className="alert-card-desc">{alert.mitigation?.suggestion || alert.description}</div>
              <div className="alert-actions">
                <button className="btn btn-primary" onClick={() => onAction?.(alert.alertId, 'approved')}>
                  ✅ Approve Reroute
                </button>
                <button className="btn btn-ghost" onClick={() => onAction?.(alert.alertId, 'ignored')}>
                  Ignore
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
