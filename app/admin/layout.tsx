'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const NAV = [
  { href: '/admin', icon: 'ti-dashboard', label: 'Dashboard' },
  { href: '/admin/donations', icon: 'ti-heart', label: 'Donations' },
  { href: '/admin/volunteers', icon: 'ti-users', label: 'Volunteers' },
  { href: '/admin/residents', icon: 'ti-user-heart', label: 'Residents' },
  { href: '/admin/messages', icon: 'ti-mail', label: 'Messages' },
  { href: '/admin/gallery', icon: 'ti-photo', label: 'Gallery' },
  { href: '/admin/campaigns', icon: 'ti-send', label: 'Campaigns' },
  { href: '/admin/settings', icon: 'ti-settings', label: 'Settings' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  }

  const sideW = collapsed ? 64 : 220;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", background: '#F3F1EC', color: '#2A2825', fontSize: 14 }}>
      {/* Sidebar */}
      <aside style={{ width: sideW, background: '#2A2825', display: 'flex', flexDirection: 'column', transition: 'width .2s', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
        {/* Logo */}
        <div style={{ padding: collapsed ? '18px 10px' : '18px 20px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', overflow: 'hidden' }}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7A430A,#E8860A)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: '#fff', flexShrink: 0 }}>
            <i className="ti ti-home-heart"></i>
          </div>
          {!collapsed && <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Aasha Bhavan</span>}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {NAV.map(n => {
            const isActive = pathname === n.href;
            return (
              <Link key={n.href} href={n.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: collapsed ? '10px 14px' : '10px 16px',
                  color: isActive ? '#E8860A' : 'rgba(255,255,255,.5)',
                  background: isActive ? 'rgba(232,134,10,.15)' : 'transparent',
                  fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all .15s', border: 'none',
                }}>
                  <i className={`ti ${n.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
                  {!collapsed && <span>{n.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 18 }}>
          <i className={`ti ${collapsed ? 'ti-chevrons-right' : 'ti-chevrons-left'}`}></i>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E5E0D6', padding: '0 28px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {NAV.find(n => n.href === pathname)?.label || 'Admin Panel'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{ fontSize: 12, color: '#9C9890', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
              <i className="ti ti-external-link" style={{ fontSize: 14 }}></i> View Site
            </Link>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#7A430A,#E8860A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>
              <i className="ti ti-user"></i>
            </div>
            <span style={{ fontSize: 13, color: '#5C5852' }}>Admin</span>
            <button onClick={handleLogout} style={{ marginLeft: 8, fontSize: 12, color: '#9C9890', background: 'none', border: '1px solid #E5E0D6', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <i className="ti ti-logout" style={{ fontSize: 13 }}></i> Logout
            </button>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: 28, flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
