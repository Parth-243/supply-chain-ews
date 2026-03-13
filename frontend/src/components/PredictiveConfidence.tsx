'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface PredictiveConfidenceProps {
  confidence?: number;
}

export default function PredictiveConfidence({ confidence = 50 }: PredictiveConfidenceProps) {
  const getColor = (c: number) => {
    if (c >= 80) return '#10b981';
    if (c >= 60) return '#06b6d4';
    if (c >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const color = getColor(confidence);

  return (
    <div className="card widget-third">
      <div className="card-header">
        <span className="card-title">🎯 Predictive Confidence</span>
      </div>
      <div className="card-body">
        <div className="confidence-container">
          <div style={{ width: 120, height: 120 }}>
            <CircularProgressbar
              value={confidence}
              text={`${confidence}%`}
              styles={buildStyles({
                textSize: '22px',
                pathColor: color,
                textColor: color,
                trailColor: '#2a3050',
                pathTransitionDuration: 1.5,
              })}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Model certainty via predict_proba()
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              {confidence >= 70
                ? '✅ High confidence — reliable prediction'
                : confidence >= 40
                  ? '⚠️ Moderate — monitor closely'
                  : '⚠️ Low confidence — weak data signal'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
