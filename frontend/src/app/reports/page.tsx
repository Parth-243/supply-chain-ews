export default function ReportsPage() {
  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>📄 Reports</h2>
      <div className="card">
        <div className="card-header"><span className="card-title">Report Dashboard</span></div>
        <div className="card-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Generate and view supply chain risk reports. This section will include downloadable PDF reports,
            historical risk analysis, and compliance documentation.
          </p>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {['Weekly Risk Summary', 'Monthly Performance', 'Route Analysis'].map(title => (
              <div key={title} className="card" style={{ background: 'var(--bg-card)' }}>
                <div className="card-body" style={{ textAlign: 'center', padding: 30 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📊</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Coming soon</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
