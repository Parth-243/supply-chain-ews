'use client';

import { useEffect, useState } from 'react';

interface DisruptionGaugeProps {
  score?: number;
}

export default function DisruptionGauge({ score = 0 }: DisruptionGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 80) return '#ef4444';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#eab308';
    if (s >= 20) return '#06b6d4';
    return '#10b981';
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'CRITICAL';
    if (s >= 60) return 'HIGH';
    if (s >= 40) return 'MODERATE';
    if (s >= 20) return 'LOW';
    return 'MINIMAL';
  };

  const color = getColor(animatedScore);
  const angle = (animatedScore / 100) * 180 - 90; // -90 to 90 degrees
  const radius = 80;
  const cx = 100;
  const cy = 90;

  // Arc path
  const startAngle = -180;
  const endAngle = 0;
  const arcStart = {
    x: cx + radius * Math.cos((startAngle * Math.PI) / 180),
    y: cy + radius * Math.sin((startAngle * Math.PI) / 180),
  };
  const arcEnd = {
    x: cx + radius * Math.cos((endAngle * Math.PI) / 180),
    y: cy + radius * Math.sin((endAngle * Math.PI) / 180),
  };

  // Filled arc
  const fillAngle = startAngle + (animatedScore / 100) * 180;
  const fillEnd = {
    x: cx + radius * Math.cos((fillAngle * Math.PI) / 180),
    y: cy + radius * Math.sin((fillAngle * Math.PI) / 180),
  };
  const largeArc = animatedScore > 50 ? 1 : 0;

  // Needle
  const needleLen = 65;
  const needleAngle = ((animatedScore / 100) * 180 - 180) * (Math.PI / 180);
  const needleX = cx + needleLen * Math.cos(needleAngle);
  const needleY = cy + needleLen * Math.sin(needleAngle);

  return (
    <div className="card widget-third">
      <div className="card-header">
        <span className="card-title">🎯 Disruption Index</span>
        <span className="pulse-dot" style={{ opacity: animatedScore >= 80 ? 1 : 0 }} />
      </div>
      <div className="card-body">
        <div className="gauge-container">
          <svg width="200" height="110" viewBox="0 0 200 110">
            {/* Background arc */}
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
              fill="none"
              stroke="#2a3050"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Filled arc */}
            {animatedScore > 0 && (
              <path
                d={`M ${arcStart.x} ${arcStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${fillEnd.x} ${fillEnd.y}`}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                style={{ transition: 'all 1s ease-out', filter: `drop-shadow(0 0 6px ${color}80)` }}
              />
            )}
            {/* Needle */}
            <line
              x1={cx} y1={cy} x2={needleX} y2={needleY}
              stroke={color} strokeWidth="2.5" strokeLinecap="round"
              style={{ transition: 'all 1s ease-out' }}
            />
            <circle cx={cx} cy={cy} r="5" fill={color} style={{ transition: 'fill 1s' }} />
            {/* Tick labels */}
            <text x="15" y="95" fill="#5a6480" fontSize="10">0</text>
            <text x="90" y="8" fill="#5a6480" fontSize="10">50</text>
            <text x="175" y="95" fill="#5a6480" fontSize="10">100</text>
          </svg>
          <div className="gauge-value" style={{ color }}>{animatedScore}</div>
          <div className="gauge-label" style={{ color }}>{getLabel(animatedScore)}</div>
        </div>
      </div>
    </div>
  );
}
