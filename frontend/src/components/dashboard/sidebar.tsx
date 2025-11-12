'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/stores/auth-store';
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Github,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview and stats',
  },
  {
    title: 'Repositories',
    href: '/dashboard/repositories',
    icon: FolderGit2,
    description: 'Manage repositories',
  },
  {
    title: 'Changelogs',
    href: '/dashboard/changelogs',
    icon: FileText,
    description: 'View generated changelogs',
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Preferences and settings',
  },
];

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onCollapseChange }: SidebarProps = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notify parent of collapse state changes
  useEffect(() => {
    if (onCollapseChange) {
      onCollapseChange(collapsed);
    }
  }, [collapsed, onCollapseChange]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300',
          collapsed && !mobileOpen ? 'w-16' : 'w-64',
          isMobile && !mobileOpen && '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold">ChangelogCraft</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-sidebar-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.title : undefined}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <Icon className={cn('size-5 shrink-0', active && 'text-primary-foreground')} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-sidebar-border" />

        {/* User Profile Section */}
        {user && (
          <div className="border-t border-sidebar-border p-3">
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-2',
                collapsed && 'justify-center'
              )}
            >
              <Avatar className="size-9 shrink-0">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.username || 'User'} />
                <AvatarFallback>
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="truncate text-sm font-medium">
                    {user.username}
                  </p>
                  {user.username && (
                    <a
                      href={`https://github.com/${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 truncate text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Github className="size-3" />
                      @{user.username}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className={cn(
                'mt-2 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="size-4" />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        )}

        {/* Collapse Button (Desktop only) */}
        {!isMobile && (
          <div className="border-t border-sidebar-border p-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'w-full justify-start gap-2',
                collapsed && 'justify-center'
              )}
            >
              {collapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <>
                  <ChevronLeft className="size-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile Menu Button - Positioned in top-left corner */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-4 z-[60] bg-background shadow-md lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation menu"
      >
        <LayoutDashboard className="size-5" />
      </Button>
    </>
  );
}
