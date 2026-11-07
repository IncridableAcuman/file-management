import { apiClient } from './api';
import type { NotificationItem } from '@/types/admin';

class NotificationService {
  public async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get<NotificationItem[]>('/notifications');
      return res.data || [];
    } catch (err) {
      console.error('Failed to get notifications:', err);
      return [];
    }
  }

  public async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
      return res.data?.unreadCount ?? 0;
    } catch {
      return 0;
    }
  }

  public async markAsRead(id: number): Promise<NotificationItem | null> {
    try {
      const res = await apiClient.patch<NotificationItem>(`/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return null;
    }
  }

  public async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }

  public async deleteNotification(id: number): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }
}

export const notificationService = new NotificationService();
