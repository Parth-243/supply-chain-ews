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
        <span className="header-label" style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>Dashboard View</span>
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
        <button className="view-btn" title="Notifications">🔔</button>
        <span className="header-datetime">🕐 {time}</span>
        <div className="header-avatar" title="User Profile">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-card)" />
            <circle cx="14" cy="11" r="4" fill="var(--text-muted)" />
            <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="var(--text-muted)" />
          </svg>
        </div>
      </div>
    </header>
  );
}
