export default function PlaybackPage() {
  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>⏪ Historical Playback & Validation</h2>
      <div className="card">
        <div className="card-header"><span className="card-title">Historical Risk Playback</span></div>
        <div className="card-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            Replay historical risk data to validate model predictions against actual outcomes.
            Compare predicted delays with actual delays to measure model accuracy over time.
          </p>
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⏪</div>
            <p>Select a date range to replay historical risk assessments and validate predictions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
