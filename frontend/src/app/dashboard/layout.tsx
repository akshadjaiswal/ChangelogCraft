/**
 * Dashboard Layout
 *
 * Layout for all dashboard pages with sidebar and footer.
 */

'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Footer } from '@/components/dashboard/footer';
import { useState, useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar onCollapseChange={setSidebarCollapsed} />

      {/* Main Content Area - Dynamic padding based on sidebar state */}
      <div
        className="flex min-h-screen flex-1 flex-col transition-all duration-300"
        style={{
          paddingLeft: isMobile ? '0' : sidebarCollapsed ? '64px' : '256px',
        }}
      >
        {/* Page Content - Add top padding on mobile for menu button */}
        <main className="flex-1 bg-background pt-16 lg:pt-0">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
