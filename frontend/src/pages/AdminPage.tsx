import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Files, 
  FolderKanban, 
  HardDrive, 
  TrendingUp, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Search, 
  Send, 
  Bell, 
  RefreshCw, 
  MoreVertical, 
  Trash2, 
  UserCog, 
  Lock, 
  Unlock, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Code2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminService } from '@/services/adminService';
import { formatBytes } from '@/lib/fileUtils';
import type { 
  AdminStats, 
  AdminUser, 
  NotificationItem, 
  NotificationType, 
  SendNotificationPayload 
} from '@/types/admin';

type AdminTab = 'overview' | 'users' | 'notifications';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Filters & Search for Users tab
  const [userSearch, setUserSearch] = useState<string>('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');

  // Notification form state
  const [notifTitle, setNotifTitle] = useState<string>('');
  const [notifMessage, setNotifMessage] = useState<string>('');
  const [notifType, setNotifType] = useState<NotificationType>('INFO');
  const [notifRecipientId, setNotifRecipientId] = useState<string>('broadcast');
  const [isSendingNotif, setIsSendingNotif] = useState<boolean>(false);
  const [notifSuccessMsg, setNotifSuccessMsg] = useState<string | null>(null);

  // User Action Modals
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUser | null>(null);
  const [directNotifUser, setDirectNotifUser] = useState<AdminUser | null>(null);

  const loadData = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      else setIsRefreshing(true);

      const [statsData, usersData, notifsData] = await Promise.all([
        adminService.getStats().catch(() => null),
        adminService.getUsers().catch(() => []),
        adminService.getSentNotifications().catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      setUsers(usersData);
      setNotifications(notifsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle User Status toggle (Active / Blocked)
  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      const updated = await adminService.setUserStatus(user.id, !user.enabled);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      loadData(true);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  // Handle User Role change (ADMIN <-> USER)
  const handleChangeUserRole = async (user: AdminUser, newRole: 'ADMIN' | 'USER') => {
    try {
      const updated = await adminService.setUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      loadData(true);
    } catch (err) {
      console.error('Failed to change user role:', err);
    }
  };

  // Handle User Delete
  const handleConfirmDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      await adminService.deleteUser(deleteTargetUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
      setDeleteTargetUser(null);
      loadData(true);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  // Send Notification
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    try {
      setIsSendingNotif(true);
      const isBroadcast = notifRecipientId === 'broadcast';
      const payload: SendNotificationPayload = {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
        isBroadcast,
        recipientId: isBroadcast ? null : Number(notifRecipientId),
      };

      await adminService.sendNotification(payload);
      setNotifTitle('');
      setNotifMessage('');
      setNotifRecipientId('broadcast');
      setNotifSuccessMsg('Bildirishnoma barcha ko\'rsatilgan foydalanuvchilarga muvaffaqiyatli jo\'natildi!');
      setTimeout(() => setNotifSuccessMsg(null), 4000);

      const notifsData = await adminService.getSentNotifications();
      setNotifications(notifsData);
    } catch (err) {
      console.error('Failed to send notification:', err);
    } finally {
      setIsSendingNotif(false);
    }
  };

  // Direct notification to specific user modal
  const handleSendDirectNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directNotifUser || !notifTitle.trim() || !notifMessage.trim()) return;

    try {
      setIsSendingNotif(true);
      const payload: SendNotificationPayload = {
        title: notifTitle.trim(),
        message: notifMessage.trim(),
        type: notifType,
        isBroadcast: false,
        recipientId: directNotifUser.id,
      };

      await adminService.sendNotification(payload);
      setNotifTitle('');
      setNotifMessage('');
      setDirectNotifUser(null);
      setNotifSuccessMsg(`${directNotifUser.username} ga bildirishnoma jo'natildi!`);
      setTimeout(() => setNotifSuccessMsg(null), 4000);

      const notifsData = await adminService.getSentNotifications();
      setNotifications(notifsData);
    } catch (err) {
      console.error('Failed to send direct notification:', err);
    } finally {
      setIsSendingNotif(false);
    }
  };

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase());

      const matchRole =
        userRoleFilter === 'all' ||
        u.role.toUpperCase() === userRoleFilter.toUpperCase();

      const matchStatus =
        userStatusFilter === 'all' ||
        (userStatusFilter === 'active' && u.enabled) ||
        (userStatusFilter === 'disabled' && !u.enabled);

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'documents':
        return <FileText className="size-4 text-blue-500" />;
      case 'images':
        return <ImageIcon className="size-4 text-emerald-500" />;
      case 'videos':
        return <Film className="size-4 text-purple-500" />;
      case 'audio':
        return <Music className="size-4 text-amber-500" />;
      case 'archives':
        return <Archive className="size-4 text-rose-500" />;
      case 'code':
        return <Code2 className="size-4 text-cyan-500" />;
      default:
        return <HelpCircle className="size-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/20">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Admin Boshqaruv Markazi
            </h1>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Foydalanuvchilar, fayllar, kataloglar tahlili va tizim bildirishnomalari
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="gap-2 rounded-xl h-9"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setActiveTab('notifications')}
            className="gap-2 rounded-xl h-9 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-sm"
          >
            <Send className="size-3.5" />
            <span>Bildirishnoma yuborish</span>
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'overview'
              ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <TrendingUp className="size-4" />
          <span>Statistika & Tahlil</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Users className="size-4" />
          <span>Foydalanuvchilar ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'notifications'
              ? 'bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
          }`}
        >
          <Bell className="size-4" />
          <span>Notification Tizimi</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {notifSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{notifSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: STATISTIKA & TAHLIL */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Main KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Users */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jami Foydalanuvchilar
                </span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalUsers ?? users.length}
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    {stats?.activeUsers ?? users.filter(u => u.enabled).length} faol
                  </Badge>
                  {(stats?.disabledUsers ?? users.filter(u => !u.enabled).length) > 0 && (
                    <Badge variant="outline" className="border-rose-500/40 text-rose-600 dark:text-rose-400">
                      {stats?.disabledUsers ?? users.filter(u => !u.enabled).length} blok
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Adminlar: <span className="font-semibold text-foreground">{stats?.adminUsers ?? users.filter(u => u.role === 'ADMIN').length}</span> • Foydalanuvchilar: <span className="font-semibold text-foreground">{stats?.regularUsers ?? users.filter(u => u.role !== 'ADMIN').length}</span>
              </div>
            </div>

            {/* 2. Total Files */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jami Fayllar
                </span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Files className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalFiles ?? 0}
                </div>
                {(stats?.trashedFiles ?? 0) > 0 && (
                  <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-600 dark:text-amber-400">
                    {stats?.trashedFiles} savatda
                  </Badge>
                )}
              </div>
              <div className="text-[11px] text-muted-foreground">
                O'rtacha hajm: <span className="font-semibold text-foreground">{formatBytes(stats?.averageFileSize ?? 0)}</span>
              </div>
            </div>

            {/* 3. Total Folders */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Jami Papkalar
                </span>
                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                  <FolderKanban className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {stats?.totalFolders ?? 0}
                </div>
                <Badge variant="secondary" className="text-xs">
                  Kataloglar
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Tizim bo'yicha yaratilgan barcha papkalar
              </div>
            </div>

            {/* 4. Total Storage Used */}
            <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ishlatilgan Xotira
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <HardDrive className="size-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-foreground">
                  {formatBytes(stats?.totalStorageUsed ?? 0)}
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  100 GB dan
                </span>
              </div>
              <Progress 
                value={Math.min(100, Math.round(((stats?.totalStorageUsed ?? 0) / (100 * 1024 * 1024 * 1024)) * 100))} 
                className="h-1.5"
              />
            </div>
          </div>

          {/* 2nd Row: Categories Distribution & System Health */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category distribution */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base text-foreground">
                    Fayl Toifalari Bo'yicha Statistika
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Fayllar turlari, soni va egallagan hajmining taqsimlanishi
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Toifalar
                </Badge>
              </div>

              <div className="space-y-4">
                {(stats?.categoryStats || []).map((cat) => {
                  const totalUsed = stats?.totalStorageUsed || 1;
                  const percent = Math.min(100, Math.round((cat.totalSize / totalUsed) * 100));

                  return (
                    <div key={cat.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(cat.category)}
                          <span className="font-medium capitalize text-foreground">
                            {cat.category}
                          </span>
                          <span className="text-muted-foreground">
                            ({cat.count} ta fayl)
                          </span>
                        </div>
                        <div className="font-semibold text-foreground">
                          {formatBytes(cat.totalSize)} <span className="text-muted-foreground font-normal">({percent}%)</span>
                        </div>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Metrics / System Info */}
            <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-base text-foreground">
                  Tizim Holati
                </h3>
                <p className="text-xs text-muted-foreground">
                  Xavfsizlik va ma'lumotlar bazasi ko'rsatkichlari
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <span className="text-muted-foreground">Autentifikatsiya</span>
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                    JWT Stateless + OTP
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <span className="text-muted-foreground">Foydalanuvchilar faolligi</span>
                  <span className="font-semibold text-foreground">
                    {stats?.totalUsers ? Math.round(((stats.activeUsers || 0) / stats.totalUsers) * 100) : 100}% faol
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <span className="text-muted-foreground">Fayl saqlash turi</span>
                  <span className="font-semibold text-foreground">Lokal Disk + Docker</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                  <span className="text-muted-foreground">Kesh & Navbat</span>
                  <span className="font-semibold text-foreground">Redis 7 + RabbitMQ</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('users')}
                className="w-full rounded-xl text-xs"
              >
                Barcha foydalanuvchilarni ko'rish
              </Button>
            </div>
          </div>

          {/* 3rd Row: Top Storage Users */}
          <div className="p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-foreground">
                  Eng Ko'p Xotira Ishlatgan Foydalanuvchilar
                </h3>
                <p className="text-xs text-muted-foreground">
                  Fayllar soni va xotira sarfi bo'yicha top foydalanuvchilar reytingi
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                Top 10
              </Badge>
            </div>

            {(!stats?.topStorageUsers || stats.topStorageUsers.length === 0) ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Hozircha ma'lumotlar mavjud emas
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground">
                      <th className="py-3 px-3 font-semibold">#</th>
                      <th className="py-3 px-3 font-semibold">Foydalanuvchi</th>
                      <th className="py-3 px-3 font-semibold">Email</th>
                      <th className="py-3 px-3 font-semibold">Rol</th>
                      <th className="py-3 px-3 font-semibold text-center">Fayllar Soni</th>
                      <th className="py-3 px-3 font-semibold text-right">Egallangan Joy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {stats.topStorageUsers.map((u, idx) => (
                      <tr key={u.userId} className="hover:bg-muted/40 transition-colors">
                        <td className="py-3 px-3 font-bold text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-3 font-medium text-foreground flex items-center gap-2">
                          <Avatar className="size-6 text-[10px]">
                            <AvatarFallback className="bg-violet-600/10 text-violet-600 font-bold">
                              {u.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{u.username}</span>
                        </td>
                        <td className="py-3 px-3 text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-3">
                          <Badge 
                            variant={u.role === 'ADMIN' ? 'default' : 'secondary'}
                            className={`text-[10px] ${u.role === 'ADMIN' ? 'bg-violet-600 text-white' : ''}`}
                          >
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-foreground">{u.filesCount}</td>
                        <td className="py-3 px-3 text-right font-bold text-violet-600 dark:text-violet-400">
                          {formatBytes(u.storageUsed)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FOYDALANUVCHILAR BOSHQARUVI */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Foydalanuvchi nomi yoki email bo'yicha qidirish..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 h-9 rounded-xl text-xs bg-muted/40"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="all">Barcha Rollar</option>
                <option value="admin">Faqat Adminlar</option>
                <option value="user">Faqat Foydalanuvchilar</option>
              </select>

              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                <option value="all">Barcha Holatlar</option>
                <option value="active">Faol</option>
                <option value="disabled">Bloklangan</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl bg-card border border-border/60 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground">
                    <th className="py-3 px-4 font-semibold">Foydalanuvchi</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Rol</th>
                    <th className="py-3 px-4 font-semibold">Holat</th>
                    <th className="py-3 px-4 font-semibold text-center">Fayllar</th>
                    <th className="py-3 px-4 font-semibold text-center">Papkalar</th>
                    <th className="py-3 px-4 font-semibold text-right">Xotira</th>
                    <th className="py-3 px-4 font-semibold">Ro'yxatdan o'tgan</th>
                    <th className="py-3 px-4 font-semibold text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        Foydalanuvchilar topilmadi
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isAdmin = u.role.toUpperCase() === 'ADMIN';

                      return (
                        <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-semibold text-xs">
                                  {u.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-foreground">{u.username}</p>
                                <span className="text-[10px] text-muted-foreground">ID: #{u.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                            {u.email}
                          </td>
                          <td className="py-3 px-4">
                            <Badge 
                              className={`text-[10px] font-semibold ${
                                isAdmin 
                                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' 
                                  : 'bg-muted text-muted-foreground border'
                              }`}
                            >
                              {isAdmin ? 'ADMIN' : 'USER'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {u.enabled ? (
                              <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                Faol
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] border-rose-500/40 text-rose-600 dark:text-rose-400 gap-1">
                                <span className="size-1.5 rounded-full bg-rose-500" />
                                Bloklangan
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-foreground">
                            {u.totalFiles}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-foreground">
                            {u.totalFolders}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-foreground">
                            {formatBytes(u.totalStorageUsed)}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8 rounded-lg">
                                  <MoreVertical className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                                <DropdownMenuLabel className="text-xs">Foydalanuvchi amallari</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {/* Toggle Admin Role */}
                                <DropdownMenuItem
                                  onClick={() => handleChangeUserRole(u, isAdmin ? 'USER' : 'ADMIN')}
                                  className="gap-2 text-xs cursor-pointer"
                                >
                                  <UserCog className="size-3.5 text-violet-500" />
                                  <span>{isAdmin ? "User darajasiga tushirish" : "Admin qilish"}</span>
                                </DropdownMenuItem>

                                {/* Toggle Active/Block Status */}
                                <DropdownMenuItem
                                  onClick={() => handleToggleUserStatus(u)}
                                  className="gap-2 text-xs cursor-pointer"
                                >
                                  {u.enabled ? (
                                    <>
                                      <Lock className="size-3.5 text-amber-500" />
                                      <span>Bloklash</span>
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="size-3.5 text-emerald-500" />
                                      <span>Faollashtirish</span>
                                    </>
                                  )}
                                </DropdownMenuItem>

                                {/* Direct Notification */}
                                <DropdownMenuItem
                                  onClick={() => {
                                    setDirectNotifUser(u);
                                    setNotifTitle('');
                                    setNotifMessage('');
                                  }}
                                  className="gap-2 text-xs cursor-pointer"
                                >
                                  <Mail className="size-3.5 text-blue-500" />
                                  <span>Bildirishnoma jo'natish</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Delete User */}
                                <DropdownMenuItem
                                  onClick={() => setDeleteTargetUser(u)}
                                  className="gap-2 text-xs text-destructive focus:text-destructive cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Foydalanuvchini o'chirish</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NOTIFICATION TIZIMI */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Notification Card / Form */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4">
            <div className="space-y-1">
              <h3 className="font-semibold text-base text-foreground flex items-center gap-2">
                <Send className="size-4 text-violet-600 dark:text-violet-400" />
                <span>Yangi Bildirishnoma</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Tizim foydalanuvchilariga xabar yoki e'lon jo'natish
              </p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3.5">
              {/* Recipient select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Qabul qiluvchi
                </label>
                <select
                  value={notifRecipientId}
                  onChange={(e) => setNotifRecipientId(e.target.value)}
                  className="w-full h-9 px-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="broadcast">📢 Barcha foydalanuvchilarga (Broadcast)</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      👤 {u.username} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Xabar Turi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['INFO', 'SUCCESS', 'WARNING', 'ALERT'] as NotificationType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNotifType(t)}
                      className={`h-8 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                        notifType === t
                          ? 'border-violet-600 bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold'
                          : 'border-input hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {t === 'INFO' && <Info className="size-3 text-blue-500" />}
                      {t === 'SUCCESS' && <CheckCircle2 className="size-3 text-emerald-500" />}
                      {t === 'WARNING' && <AlertTriangle className="size-3 text-amber-500" />}
                      {t === 'ALERT' && <AlertCircle className="size-3 text-rose-500" />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Sarlavha
                </label>
                <Input
                  type="text"
                  placeholder="Masalan: Tizim yangilanishi..."
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              {/* Message textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Xabar Matni
                </label>
                <textarea
                  rows={4}
                  placeholder="Bildirishnoma tafsilotlarini kiriting..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                  className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                className="w-full rounded-xl h-9 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold gap-2 shadow-sm"
              >
                <Send className="size-3.5" />
                <span>{isSendingNotif ? "Jo'natilmoqda..." : "Bildirishnomani Yuborish"}</span>
              </Button>
            </form>
          </div>

          {/* History of Sent Notifications */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-base text-foreground">
                  Yuborilgan Bildirishnomalar Tarixi
                </h3>
                <p className="text-xs text-muted-foreground">
                  Oxirgi yuborilgan xabarlar va e'lonlar
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {notifications.length} ta xabar
              </Badge>
            </div>

            {notifications.length === 0 ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                <Bell className="size-8 mx-auto mb-2 opacity-30" />
                <p>Hozircha hech qanday bildirishnoma jo'natilmagan</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {notifications.map((n) => {
                  let IconComp = Info;
                  let badgeColor = 'bg-blue-500/10 text-blue-600 border-blue-500/30';
                  if (n.type === 'SUCCESS') {
                    IconComp = CheckCircle2;
                    badgeColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
                  } else if (n.type === 'WARNING') {
                    IconComp = AlertTriangle;
                    badgeColor = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
                  } else if (n.type === 'ALERT') {
                    IconComp = AlertCircle;
                    badgeColor = 'bg-rose-500/10 text-rose-600 border-rose-500/30';
                  }

                  return (
                    <div
                      key={n.id}
                      className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badgeColor}`}>
                            <IconComp className="size-3" />
                            {n.type}
                          </span>
                          <h4 className="font-semibold text-sm text-foreground">{n.title}</h4>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {n.createdAt ? new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 border-t border-border/40 text-[11px] text-muted-foreground">
                        <span>Kimga:</span>
                        {n.isBroadcast ? (
                          <Badge variant="outline" className="text-[10px] border-violet-500/30 text-violet-600 dark:text-violet-400">
                            📢 Barcha foydalanuvchilarga (Broadcast)
                          </Badge>
                        ) : (
                          <span className="font-semibold text-foreground">
                            👤 {n.recipientUsername || n.recipientEmail || `User #${n.recipientId}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Direct Notification Modal */}
      {directNotifUser && (
        <Dialog open={!!directNotifUser} onOpenChange={() => setDirectNotifUser(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Mail className="size-4 text-violet-600" />
                <span>{directNotifUser.username} ga Bildirishnoma Yuborish</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ushbu bildirishnoma faqat {directNotifUser.email} foydalanuvchisiga ko'rinadi.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSendDirectNotification} className="space-y-3.5 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Turi</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['INFO', 'SUCCESS', 'WARNING', 'ALERT'] as NotificationType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNotifType(t)}
                      className={`h-7 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 ${
                        notifType === t
                          ? 'border-violet-600 bg-violet-500/10 text-violet-600 font-semibold'
                          : 'border-input hover:bg-muted/40 text-muted-foreground'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Sarlavha</label>
                <Input
                  type="text"
                  placeholder="Sarlavha..."
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                  className="h-9 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Xabar matni</label>
                <textarea
                  rows={3}
                  placeholder="Xabarni yozing..."
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDirectNotifUser(null)}
                  className="rounded-xl text-xs"
                >
                  Bekor qilish
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSendingNotif || !notifTitle.trim() || !notifMessage.trim()}
                  className="rounded-xl text-xs bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isSendingNotif ? "Jo'natilmoqda..." : "Yuborish"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete User Confirmation Dialog */}
      {deleteTargetUser && (
        <Dialog open={!!deleteTargetUser} onOpenChange={() => setDeleteTargetUser(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="size-4" />
                <span>Foydalanuvchini o'chirishni tasdiqlang</span>
              </DialogTitle>
              <DialogDescription className="text-xs leading-relaxed">
                Haqiqatan ham <strong className="text-foreground">{deleteTargetUser.username}</strong> ({deleteTargetUser.email}) hisobini o'chirib tashlamoqchimisiz?
                Foydalanuvchiga tegishli barcha fayllar ({deleteTargetUser.totalFiles} ta), papkalar ({deleteTargetUser.totalFolders} ta) va bildirishnomalar butunlay o'chiriladi. Ushbu amalni ortga qaytarib bo'lmaydi!
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTargetUser(null)}
                className="rounded-xl text-xs"
              >
                Bekor qilish
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleConfirmDeleteUser}
                className="rounded-xl text-xs"
              >
                Ha, o'chirilsin
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
