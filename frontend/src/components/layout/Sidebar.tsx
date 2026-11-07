import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Star, 
  Clock, 
  Trash2, 
  HardDrive, 
  Plus, 
  Cloud, 
  Settings, 
  Sparkles,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/fileUtils';
import type { StorageStats } from '@/types/file';
import { useAuth } from '@/context/AuthContext';

export type NavTab = 'dashboard' | 'my-files' | 'shared' | 'starred' | 'recent' | 'trash' | 'admin';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  storageStats: StorageStats;
  onOpenUpload: () => void;
  onOpenSettings: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  storageStats,
  onOpenUpload,
  onOpenSettings,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const isAdmin = (user?.role?.name || user?.role?.type || '').toUpperCase() === 'ADMIN';

  const percentUsed = Math.min(
    100,
    Math.round((storageStats.used / (storageStats.total || 1)) * 100)
  );

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'my-files' as NavTab,
      label: 'My Files',
      icon: FolderKanban,
      badge: null,
    },
    {
      id: 'shared' as NavTab,
      label: 'Shared with me',
      icon: Users,
      badge: '2',
    },
    {
      id: 'starred' as NavTab,
      label: 'Starred',
      icon: Star,
      badge: null,
    },
    {
      id: 'recent' as NavTab,
      label: 'Recent',
      icon: Clock,
      badge: null,
    },
    {
      id: 'trash' as NavTab,
      label: 'Trash',
      icon: Trash2,
      badge: null,
    },
    ...(isAdmin
      ? [
          {
            id: 'admin' as NavTab,
            label: 'Admin Panel',
            icon: ShieldCheck,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between p-4">
      {/* Top: Logo & Navigation */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-lg shadow-blue-500/25 text-white">
            <HardDrive className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                FileVault
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Cloud className="size-3 text-emerald-500 animate-pulse" />
              Cloud Storage System
            </p>
          </div>
        </div>

        {/* Quick Upload action button */}
        <div className="px-1">
          <Button
            onClick={onOpenUpload}
            className="w-full h-11 justify-start gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <div className="flex size-6 items-center justify-center rounded-lg bg-white/20">
              <Plus className="size-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Upload New File</span>
          </Button>
        </div>

        {/* Main Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25 font-semibold'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`size-4.5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge ? (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  <ChevronRight
                    className={`size-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive ? 'opacity-100' : ''
                    }`}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Storage Card & Settings */}
      <div className="space-y-3 pt-4 border-t border-border/40">
        {/* Storage Widget Card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/40 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HardDrive className="size-4" />
              </div>
              <span className="text-xs font-semibold text-foreground">Storage Plan</span>
            </div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {percentUsed}%
            </span>
          </div>

          <Progress value={percentUsed} className="h-2 rounded-full mb-2 bg-muted" />

          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
            <span>{formatBytes(storageStats.used)} used</span>
            <span>{formatBytes(storageStats.total)} total</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="w-full text-xs h-8 rounded-lg gap-1.5 border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-600 font-medium transition-all"
          >
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Manage Storage</span>
          </Button>
        </div>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-all"
        >
          <Settings className="size-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col fixed inset-y-0 left-0 z-30 border-r border-border/60 bg-card/60 backdrop-blur-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative flex w-72 max-w-[80vw] flex-col bg-background shadow-2xl border-r border-border">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
