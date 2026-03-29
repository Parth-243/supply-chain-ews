'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [time, setTime] = useState('');
  const [activeView, setActiveView] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short',
        day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const roleColor = user?.role === 'Admin' ? 'var(--accent-cyan)' : 'var(--warning)';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Supply Chain Disruption Early Warning System</h1>
      </div>

      <div className="header-center">
        <span className="header-label" style={{ fontSize: 12, color: 'var(--text-muted)', marginRight: 8 }}>Dashboard View</span>
        {(['dashboard', 'list', 'split'] as const).map((view, i) => (
          <button key={view} className={`view-btn ${activeView === view ? 'active' : ''}`}
            onClick={() => setActiveView(view)} title={`${view} view`}>
            {(['📊', '📋', '⊞'] as const)[i]}
          </button>
        ))}
      </div>

      <div className="header-right">
        <button className="view-btn" title="Notifications">🔔</button>
        <span className="header-datetime">🕐 {time}</span>

        {/* User Avatar + Dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            title="User menu"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: menuOpen ? 'var(--bg-card)' : 'transparent',
              border: `1px solid ${menuOpen ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-sm)', padding: '4px 10px 4px 6px',
              cursor: 'pointer', fontSize: 12,
              transition: 'all 0.2s',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="var(--border-color)" strokeWidth="1.5" fill="var(--bg-card)" />
              <circle cx="14" cy="11" r="4" fill="var(--text-muted)" />
              <path d="M6 24c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="var(--text-muted)" />
            </svg>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.username || 'Guest'}</span>
            {user?.role && (
              <span style={{ fontSize: 10, color: roleColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {user.role}
              </span>
            )}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius)', padding: 8, minWidth: 180,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 200,
              animation: 'slideUp 0.15s ease both',
            }}>
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{user?.username}</div>
                <div style={{ fontSize: 11, color: roleColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{user?.role}</div>
              </div>
              <button
                id="logout-btn"
                onClick={() => { setMenuOpen(false); logout(); }}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px',
                  background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger)', fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background 0.15s', fontFamily: 'inherit',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
