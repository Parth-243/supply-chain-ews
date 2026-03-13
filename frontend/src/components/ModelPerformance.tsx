'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface PerfEntry {
  evaluatedAt: string;
  metrics: {
    mae: number;
    f1Score: number;
    accuracy: number;
  };
}

interface ModelPerformanceProps {
  history: PerfEntry[];
}

export default function ModelPerformance({ history = [] }: ModelPerformanceProps) {
  const chartData = history
    .slice(0, 14)
    .reverse()
    .map((entry) => ({
      date: new Date(entry.evaluatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      MAE: entry.metrics?.mae || 0,
      F1: (entry.metrics?.f1Score || 0) * 100,
      Accuracy: (entry.metrics?.accuracy || 0) * 100,
    }));

  return (
    <div className="card widget-full">
      <div className="card-header">
        <span className="card-title">📉 Model Performance Logs</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last 14 days</span>
      </div>
      <div className="card-body" style={{ height: 220 }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3050" />
              <XAxis dataKey="date" tick={{ fill: '#5a6480', fontSize: 10 }} />
              <YAxis tick={{ fill: '#5a6480', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: '#1a1f35',
                  border: '1px solid #2a3050',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#f0f4ff',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#8b95b0' }} />
              <Line type="monotone" dataKey="F1" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} name="F1-Score (%)" />
              <Line type="monotone" dataKey="Accuracy" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Accuracy (%)" />
              <Line type="monotone" dataKey="MAE" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="MAE" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            No performance data available
          </div>
        )}
      </div>
    </div>
  );
}
