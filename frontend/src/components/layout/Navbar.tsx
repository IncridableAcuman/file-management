import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Plus, 
  FolderPlus, 
  UploadCloud, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  ShieldCheck, 
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Info,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { notificationService } from '@/services/notificationService';
import type { NotificationItem } from '@/types/admin';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar: () => void;
  onRequestLogout: () => void;
  onNavigateToAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenNewFolder,
  onOpenSettings,
  onToggleMobileSidebar,
  onRequestLogout,
  onNavigateToAdmin,
}) => {
  const { setTheme, isDark } = useTheme();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchNotifications = useCallback(async () => {
    try {
      const [list, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnreadCount(count);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const isAdmin = (user?.role?.name || user?.role?.type || '').toUpperCase() === 'ADMIN';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const initials = user?.username
    ? user.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'US';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-6 backdrop-blur-md transition-all">
      {/* Left: Mobile trigger & Logo (on small screens) */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        <div className="flex items-center gap-2.5 md:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-md shadow-blue-500/20 text-white font-bold">
            <HardDrive className="size-5" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            FileVault
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-72 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files, folders, tags... (Ctrl + K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 h-9 bg-muted/40 border-muted-foreground/20 focus-visible:bg-background rounded-xl text-sm transition-all focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, New Button, Notifications, Dark Mode, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* New Item Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/20 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl">
            <DropdownMenuItem
              onClick={onOpenUpload}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm font-medium"
            >
              <UploadCloud className="size-4 text-blue-600 dark:text-blue-400" />
              <span>Upload Files</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenNewFolder}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm font-medium"
            >
              <FolderPlus className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>New Folder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="size-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow ring-2 ring-background animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 md:w-96 p-2 rounded-xl shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 ? (
                  <Badge variant="default" className="text-xs bg-blue-600 text-white hover:bg-blue-600">
                    {unreadCount} New
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">0 New</Badge>
                )}
              </div>
              {notifications.length > 0 && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto space-y-1 py-1.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Bell className="size-6 mx-auto mb-2 opacity-30" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => {
                  let IconComp = Info;
                  let colorClass = "text-blue-500 bg-blue-500/10";
                  if (n.type === 'SUCCESS') {
                    IconComp = CheckCircle2;
                    colorClass = "text-emerald-500 bg-emerald-500/10";
                  } else if (n.type === 'WARNING') {
                    IconComp = AlertTriangle;
                    colorClass = "text-amber-500 bg-amber-500/10";
                  } else if (n.type === 'ALERT') {
                    IconComp = AlertTriangle;
                    colorClass = "text-rose-500 bg-rose-500/10";
                  }

                  return (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`p-2.5 rounded-lg text-xs space-y-1 cursor-pointer transition-colors flex gap-3 ${
                        n.isRead ? 'opacity-70 hover:bg-muted/40' : 'bg-muted/50 hover:bg-muted/80 font-medium'
                      }`}
                    >
                      <div className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <IconComp className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-semibold text-foreground truncate">{n.title}</p>
                          {!n.isRead && (
                            <span className="size-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }) : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all outline-none">
              <Avatar className="size-8 ring-2 ring-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {user?.username || 'User'}
                  </p>
                  {isAdmin ? (
                    <Badge className="text-[10px] py-0 px-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold">
                      ADMIN
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-500/40 text-blue-600 dark:text-blue-400">
                      Pro
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate leading-none">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isAdmin && onNavigateToAdmin && (
              <DropdownMenuItem
                onClick={onNavigateToAdmin}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/30 mb-1"
              >
                <ShieldCheck className="size-4" />
                <span>Admin Dashboard</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm"
            >
              <UserIcon className="size-4 text-muted-foreground" />
              <span>Profile & Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm"
            >
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>Security & 2FA</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRequestLogout}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
