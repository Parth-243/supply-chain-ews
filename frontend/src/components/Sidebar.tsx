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

  const toggle = (key: 'email' | 'sms' | 'push') => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🚨</div>
        <div className="logo-text">Supply Chain<br />Disruption EWS</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}

        <div className="nav-divider" />

        <Link
          href="/notifications"
          className={`nav-item ${pathname === '/notifications' ? 'active' : ''}`}
        >
          <span className="nav-icon">🔔</span>
          Notification Center
          <span className="pulse-dot" style={{ marginLeft: 'auto' }} />
        </Link>

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

        <div className="nav-divider" />

        <Link
          href="/maintenance"
          className={`nav-item ${pathname === '/maintenance' ? 'active' : ''}`}
        >
          <span className="nav-icon">📉</span>
          Model Performance Logs
        </Link>
      </nav>
    </aside>
  );
}
