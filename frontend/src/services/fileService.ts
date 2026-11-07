import { apiClient, API_BASE_URL } from './api';
import type { 
  FileItem, 
  FolderItem, 
  StorageStats 
} from '@/types/file';

function normalizeFile(file: FileItem): FileItem {
  let thumb = file.thumbnailUrl;
  if (thumb && !thumb.startsWith('http://') && !thumb.startsWith('https://') && !thumb.startsWith('blob:')) {
    const token = localStorage.getItem('fms_access_token');
    const base = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
    thumb = `${base}${thumb}${token ? `?token=${token}` : ''}`;
  }
  return {
    ...file,
    thumbnailUrl: thumb,
  };
}

class FileService {
  public async getFiles(params?: {
    category?: string;
    folderId?: string;
    trashed?: boolean;
    favorite?: boolean;
    search?: string;
  }): Promise<FileItem[]> {
    try {
      const res = await apiClient.get<FileItem[]>('/files', { params });
      return (res.data || []).map(normalizeFile);
    } catch (err) {
      console.error('Failed to get files:', err);
      return [];
    }
  }

  public async getSharedFiles(): Promise<FileItem[]> {
    try {
      const res = await apiClient.get<FileItem[]>('/files/shared');
      return (res.data || []).map(normalizeFile);
    } catch (err) {
      console.error('Failed to get shared files:', err);
      return [];
    }
  }

  public async getFolders(params?: {
    trashed?: boolean;
    favorite?: boolean;
  }): Promise<FolderItem[]> {
    try {
      const res = await apiClient.get<FolderItem[]>('/folders', { params });
      return res.data || [];
    } catch (err) {
      console.error('Failed to get folders:', err);
      return [];
    }
  }

  public async getFolderById(id: string): Promise<FolderItem | undefined> {
    try {
      const res = await apiClient.get<FolderItem>(`/folders/${id}`);
      return res.data;
    } catch {
      return undefined;
    }
  }

  public async getFileById(id: string): Promise<FileItem | undefined> {
    try {
      const res = await apiClient.get<FileItem>(`/files/${id}`);
      return res.data ? normalizeFile(res.data) : undefined;
    } catch {
      return undefined;
    }
  }

  public async createFolder(name: string, parentId: string | null = null, color = '#3b82f6'): Promise<FolderItem> {
    const res = await apiClient.post<FolderItem>('/folders', {
      name: name.trim(),
      parentId: parentId ? Number(parentId) : null,
      color,
    });
    return res.data;
  }

  public async uploadFiles(files: File[], folderId: string | number | null = null): Promise<FileItem[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId !== null && folderId !== undefined && String(folderId) !== 'null' && String(folderId).trim() !== '') {
      formData.append('folderId', String(folderId));
    }

    const res = await apiClient.post<FileItem[]>('/files/upload', formData);
    return (res.data || []).map(normalizeFile);
  }

  public async toggleFavorite(id: string, isFolder: boolean = false): Promise<void> {
    if (isFolder) {
      await apiClient.patch(`/folders/${id}/favorite`);
    } else {
      await apiClient.patch(`/files/${id}/favorite`);
    }
  }

  public async renameItem(id: string, newName: string, isFolder: boolean = false): Promise<void> {
    if (isFolder) {
      await apiClient.patch(`/folders/${id}/rename`, { name: newName.trim() });
    } else {
      await apiClient.patch(`/files/${id}/rename`, { name: newName.trim() });
    }
  }

  public async moveToTrash(id: string, isFolder: boolean = false): Promise<void> {
    if (isFolder) {
      await apiClient.patch(`/folders/${id}/trash`);
    } else {
      await apiClient.patch(`/files/${id}/trash`);
    }
  }

  public async restoreFromTrash(id: string, isFolder: boolean = false): Promise<void> {
    if (isFolder) {
      await apiClient.patch(`/folders/${id}/restore`);
    } else {
      await apiClient.patch(`/files/${id}/restore`);
    }
  }

  public async deletePermanently(id: string, isFolder: boolean = false): Promise<void> {
    if (isFolder) {
      await apiClient.delete(`/folders/${id}`);
    } else {
      await apiClient.delete(`/files/${id}`);
    }
  }

  public async emptyTrash(): Promise<void> {
    await apiClient.delete('/files/trash/empty');
  }

  public async shareFile(id: string, email: string, role: 'viewer' | 'editor'): Promise<void> {
    await apiClient.post(`/files/${id}/share`, { email, role });
  }

  public async getStorageStats(): Promise<StorageStats> {
    try {
      const res = await apiClient.get<StorageStats>('/files/storage-stats');
      return res.data;
    } catch (err) {
      console.error('Failed to get storage stats:', err);
      return {
        total: 100 * 1024 * 1024 * 1024,
        used: 0,
        categories: [],
      };
    }
  }

  public async downloadFile(id: string, filename: string): Promise<void> {
    const res = await apiClient.get(`/files/${id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  public resetToDefault(): void {
    // No-op for real backend
    localStorage.removeItem('fms_files_v1');
    localStorage.removeItem('fms_folders_v1');
  }
}

export const fileService = new FileService();
