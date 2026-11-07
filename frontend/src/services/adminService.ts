import { apiClient } from './api';
import type { 
  AdminStats, 
  AdminUser, 
  NotificationItem, 
  SendNotificationPayload 
} from '@/types/admin';

class AdminService {
  public async getStats(): Promise<AdminStats> {
    const res = await apiClient.get<AdminStats>('/admin/stats');
    return res.data;
  }

  public async getUsers(): Promise<AdminUser[]> {
    const res = await apiClient.get<AdminUser[]>('/admin/users');
    return res.data || [];
  }

  public async setUserStatus(id: number, enabled: boolean): Promise<AdminUser> {
    const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/status`, null, {
      params: { enabled },
    });
    return res.data;
  }

  public async setUserRole(id: number, role: 'ADMIN' | 'USER'): Promise<AdminUser> {
    const res = await apiClient.patch<AdminUser>(`/admin/users/${id}/role`, null, {
      params: { role },
    });
    return res.data;
  }

  public async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`);
  }

  public async sendNotification(payload: SendNotificationPayload): Promise<NotificationItem[]> {
    const res = await apiClient.post<NotificationItem[]>('/admin/notifications', payload);
    return res.data || [];
  }

  public async getSentNotifications(): Promise<NotificationItem[]> {
    const res = await apiClient.get<NotificationItem[]>('/admin/notifications');
    return res.data || [];
  }
}

export const adminService = new AdminService();
