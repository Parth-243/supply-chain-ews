'use client';

import SystemHealth from '@/components/SystemHealth';
import ModelPerformance from '@/components/ModelPerformance';

const demoPerf = Array.from({ length: 14 }, (_, i) => ({
  evaluatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  metrics: { mae: 3 + Math.random() * 5, f1Score: 0.75 + Math.random() * 0.2, accuracy: 0.82 + Math.random() * 0.1 }
}));

export default function MaintenancePage() {
  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>⚙️ System Health & Maintenance</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 13 }}>
        Monitor system health, API performance, and ML model accuracy metrics.
      </p>
      <div className="dashboard-grid">
        <SystemHealth apiLatency={42.5} ingestionRate={38} mlStatus="connected" uptime={172800} />
        <ModelPerformance history={demoPerf} />
      </div>
    </div>
  );
}
