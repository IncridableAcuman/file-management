export interface CategoryStat {
  category: string;
  count: number;
  totalSize: number;
}

export interface UserStorageStat {
  userId: number;
  username: string;
  email: string;
  role: string;
  filesCount: number;
  storageUsed: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalFiles: number;
  trashedFiles: number;
  totalFolders: number;
  totalStorageUsed: number;
  averageFileSize: number;
  categoryStats: CategoryStat[];
  topStorageUsers: UserStorageStat[];
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  updatedAt?: string;
  totalFiles: number;
  totalFolders: number;
  totalStorageUsed: number;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'SYSTEM';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  isBroadcast: boolean;
  createdAt: string;
  recipientId?: number;
  recipientEmail?: string;
  recipientUsername?: string;
}

export interface SendNotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  recipientId?: number | null;
  isBroadcast?: boolean;
}
