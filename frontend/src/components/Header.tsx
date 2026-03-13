'use client';

import { useEffect, useState } from 'react';

export default function Header() {
  const [time, setTime] = useState('');
  const [activeView, setActiveView] = useState('dashboard');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Supply Chain Disruption Early Warning System</h1>
      </div>

      <div className="header-center">
        <button
          className={`view-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
          title="Dashboard View"
        >
          📊
        </button>
        <button
          className={`view-btn ${activeView === 'list' ? 'active' : ''}`}
          onClick={() => setActiveView('list')}
          title="List View"
        >
          📋
        </button>
        <button
          className={`view-btn ${activeView === 'split' ? 'active' : ''}`}
          onClick={() => setActiveView('split')}
          title="Split View"
        >
          ⊞
        </button>
      </div>

      <div className="header-right">
        <span>🕐 {time}</span>
        <button className="view-btn" title="More options">⋯</button>
      </div>
    </header>
  );
}
