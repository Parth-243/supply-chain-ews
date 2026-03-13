'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/reports', label: 'Reports', icon: '📄' },
  { href: '/analytics', label: 'Analytics', icon: '📈' },
  { href: '/simulator', label: 'Predictive Simulator', icon: '🔮' },
  { href: '/maintenance', label: 'Maintenance', icon: '⚙️' },
  { href: '/playback', label: 'Historical Playback', icon: '⏪' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [toggles, setToggles] = useState({ email: false, sms: false, push: true });
  const [collapsed, setCollapsed] = useState(false);

  const toggle = (key: 'email' | 'sms' | 'push') => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-icon sidebar-hide-collapsed">🚨</div>
        <div className="logo-text sidebar-hide-collapsed">Supply Chain<br />Disruption EWS</div>
        <button
          className="sidebar-toggle-btn"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="sidebar-hide-collapsed">{item.label}</span>
          </Link>
        ))}

        <div className="nav-divider" />

        <Link
          href="/notifications"
          className={`nav-item ${pathname === '/notifications' ? 'active' : ''}`}
          title={collapsed ? 'Notification Center' : undefined}
        >
          <span className="nav-icon">🔔</span>
          <span className="sidebar-hide-collapsed">Notification Center</span>
          <span className="pulse-dot sidebar-hide-collapsed" style={{ marginLeft: 'auto' }} />
        </Link>

        <div className="sidebar-hide-collapsed">
          <div className="sidebar-section-label">Notifications</div>
          {(['email', 'sms', 'push'] as const).map(key => (
            <div key={key} className="toggle-row">
              <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <button
                className={`toggle-switch ${toggles[key] ? 'active' : ''}`}
                onClick={() => toggle(key)}
              />
            </div>
          ))}
        </div>

        <div className="nav-divider" />

        <Link
          href="/maintenance"
          className={`nav-item ${pathname === '/maintenance' ? 'active' : ''}`}
          title={collapsed ? 'Model Performance Logs' : undefined}
        >
          <span className="nav-icon">📉</span>
          <span className="sidebar-hide-collapsed">Model Performance Logs</span>
        </Link>
      </nav>
    </aside>
  );
}
