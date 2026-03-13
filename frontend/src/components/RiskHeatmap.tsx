'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

interface HeatmapPoint {
  lat: number;
  lng: number;
  name: string;
  avgRisk: number;
  intensity: number;
  count: number;
}

interface RiskHeatmapProps {
  data: HeatmapPoint[];
}

// Dynamically import the map to avoid SSR issues with Leaflet
const MapInner = dynamic(() => import('./MapInner'), { ssr: false, loading: () => (
  <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
    Loading map...
  </div>
)});

export default function RiskHeatmap({ data = [] }: RiskHeatmapProps) {
  const memoData = useMemo(() => data, [data]);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">🗺️ Interactive Global Risk Heatmap</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{data.length} locations</span>
      </div>
      <div className="card-body" style={{ padding: 0, height: 340 }}>
        <MapInner data={memoData} />
      </div>
    </div>
  );
}
