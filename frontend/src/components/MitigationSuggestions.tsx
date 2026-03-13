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

interface MitigationSuggestionsProps {
  alerts: Alert[];
  onAction?: (alertId: string, action: string) => void;
}

const typeIcons: Record<string, string> = {
  congestion: '🚢',
  weather: '🌪️',
  strike: '✊',
  geopolitical: '🌐',
  default: '⚠️',
};

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: 'var(--warning-soft)', color: 'var(--warning)', label: 'Pending Review' },
  approved: { bg: 'var(--success-soft)', color: 'var(--success)', label: 'Approved' },
  ignored: { bg: 'rgba(100,116,139,0.15)', color: 'var(--neutral-tag)', label: 'Ignored' },
};

export default function MitigationSuggestions({ alerts = [], onAction }: MitigationSuggestionsProps) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🛡️ Automated Mitigation Suggestions</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {alerts.length} active {alerts.length === 1 ? 'alert' : 'alerts'}
        </span>
      </div>
      <div className="card-body" style={{ padding: 0 }}>
        {alerts.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            No active alerts — all clear
          </div>
        ) : (
          <div className="mitigation-list">
            {alerts.map(alert => {
              const icon = typeIcons[alert.type] || typeIcons.default;
              const status = statusStyles[alert.mitigation?.status] || statusStyles.pending;

              return (
                <div key={alert.alertId} className="mitigation-row">
                  <div className="mitigation-left">
                    <div className="mitigation-icon-wrap">
                      <span className="mitigation-icon">{icon}</span>
                      <span
                        className={`mitigation-severity ${alert.severity}`}
                      >
                        {alert.severity === 'critical' ? 'CRIT' : 'HIGH'}
                      </span>
                    </div>

                    <div className="mitigation-info">
                      <div className="mitigation-title">{alert.title}</div>
                      <div className="mitigation-suggestion">
                        💡 {alert.mitigation?.suggestion || alert.description}
                      </div>
                      <div className="mitigation-meta">
                        <span
                          style={{
                            background: status.bg,
                            color: status.color,
                            padding: '2px 8px',
                            borderRadius: 4,
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {status.label}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          Risk Score: <strong style={{ color: alert.riskScore >= 80 ? 'var(--danger)' : 'var(--warning)' }}>{alert.riskScore}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {alert.mitigation?.status === 'pending' && (
                    <div className="mitigation-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => onAction?.(alert.alertId, 'approved')}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => onAction?.(alert.alertId, 'ignored')}
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
