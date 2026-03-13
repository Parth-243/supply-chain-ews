'use client';

import { useState } from 'react';

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState({
    email: { enabled: false, address: '' },
    sms: { enabled: false, phone: '' },
    push: { enabled: true },
    alertThreshold: 80,
  });

  return (
    <div>
      <h2 style={{ fontSize: 20, marginBottom: 20 }}>🔔 Notification Center</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 13 }}>
        Configure how and when you receive alerts. Set your preferred channels and risk threshold.
      </p>

      <div className="dashboard-grid">
        <div className="card widget-half">
          <div className="card-header"><span className="card-title">📧 Notification Channels</span></div>
          <div className="card-body">
            {[
              { key: 'email' as const, label: 'Email Notifications', icon: '📧', desc: 'Receive HTML email alerts via Nodemailer' },
              { key: 'sms' as const, label: 'SMS Notifications', icon: '📱', desc: 'Receive text alerts via Twilio API' },
              { key: 'push' as const, label: 'Push Notifications', icon: '🔔', desc: 'Browser push notifications' },
            ].map(channel => (
              <div key={channel.key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0', borderBottom: '1px solid var(--glass-border)'
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{channel.icon} {channel.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{channel.desc}</div>
                </div>
                <button
                  className={`toggle-switch ${prefs[channel.key]?.enabled ?? (prefs[channel.key] as unknown as { enabled: boolean })?.enabled ?? false ? 'active' : ''}`}
                  onClick={() => setPrefs(p => {
                    if (channel.key === 'push') return { ...p, push: { enabled: !p.push.enabled } };
                    return { ...p, [channel.key]: { ...p[channel.key], enabled: !(p[channel.key] as { enabled: boolean }).enabled } };
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card widget-half">
          <div className="card-header"><span className="card-title">⚡ Alert Threshold</span></div>
          <div className="card-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
              Only send notifications when risk score exceeds this threshold.
            </p>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent-cyan)' }}>{prefs.alertThreshold}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Threshold</div>
            </div>
            <div className="simulator-control">
              <div className="simulator-label">
                <span>Risk Score Threshold</span>
                <span>{prefs.alertThreshold}</span>
              </div>
              <input type="range" min="0" max="100" value={prefs.alertThreshold}
                onChange={e => setPrefs(p => ({ ...p, alertThreshold: parseInt(e.target.value) }))}
                className="simulator-slider" />
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              💡 Recommended: 80 (only critical alerts). Lower values will increase notification frequency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
