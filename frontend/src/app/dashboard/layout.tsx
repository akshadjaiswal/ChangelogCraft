/**
 * Dashboard Layout
 *
 * Layout for all dashboard pages with sidebar and footer.
 */

import { Sidebar } from '@/components/dashboard/sidebar';
import { Footer } from '@/components/dashboard/footer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
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
