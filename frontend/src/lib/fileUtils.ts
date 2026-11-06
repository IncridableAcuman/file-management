import { 
  FileText, 
  FileCode, 
  FileSpreadsheet, 
  Film, 
  Music, 
  Archive, 
  Image as ImageIcon, 
  File, 
  type LucideIcon 
} from 'lucide-react';
import type { FileCategory, FileItem } from '@/types/file';

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export interface FileTypeMeta {
  category: FileCategory;
  icon: LucideIcon;
  color: string;
  badgeBg: string;
  badgeText: string;
}

export function getFileMeta(fileName: string, mimeType?: string): FileTypeMeta {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // Images
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'bmp'].includes(ext) || mimeType?.startsWith('image/')) {
    return {
      category: 'images',
      icon: ImageIcon,
      color: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 dark:bg-amber-500/20',
      badgeText: 'text-amber-600 dark:text-amber-300',
    };
  }

  // Videos
  if (['mp4', 'mkv', 'mov', 'avi', 'webm', 'wmv'].includes(ext) || mimeType?.startsWith('video/')) {
    return {
      category: 'videos',
      icon: Film,
      color: 'text-purple-500 dark:text-purple-400',
      badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20',
      badgeText: 'text-purple-600 dark:text-purple-300',
    };
  }

  // Audio
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext) || mimeType?.startsWith('audio/')) {
    return {
      category: 'audio',
      icon: Music,
      color: 'text-rose-500 dark:text-rose-400',
      badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
      badgeText: 'text-rose-600 dark:text-rose-300',
    };
  }

  // Spreadsheets
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) {
    return {
      category: 'documents',
      icon: FileSpreadsheet,
      color: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      badgeText: 'text-emerald-600 dark:text-emerald-300',
    };
  }

  // Code
  if (['ts', 'tsx', 'js', 'jsx', 'html', 'css', 'json', 'java', 'py', 'go', 'rs', 'c', 'cpp', 'sql', 'yaml', 'yml'].includes(ext)) {
    return {
      category: 'code',
      icon: FileCode,
      color: 'text-cyan-500 dark:text-cyan-400',
      badgeBg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
      badgeText: 'text-cyan-600 dark:text-cyan-300',
    };
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return {
      category: 'archives',
      icon: Archive,
      color: 'text-orange-500 dark:text-orange-400',
      badgeBg: 'bg-orange-500/10 dark:bg-orange-500/20',
      badgeText: 'text-orange-600 dark:text-orange-300',
    };
  }

  // Documents
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt', 'ppt', 'pptx'].includes(ext)) {
    return {
      category: 'documents',
      icon: FileText,
      color: 'text-blue-500 dark:text-blue-400',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20',
      badgeText: 'text-blue-600 dark:text-blue-300',
    };
  }

  return {
    category: 'other',
    icon: File,
    color: 'text-slate-500 dark:text-slate-400',
    badgeBg: 'bg-slate-500/10 dark:bg-slate-500/20',
    badgeText: 'text-slate-600 dark:text-slate-300',
  };
}

import { API_BASE_URL, apiClient } from '@/services/api';

export function detectCategory(fileName: string): FileCategory {
  return getFileMeta(fileName).category;
}

export async function downloadMockFile(file: FileItem) {
  try {
    const res = await apiClient.get(`/files/${file.id}/download`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: file.mimeType || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Download failed via apiClient, trying direct url:', err);
    const token = localStorage.getItem('fms_access_token');
    const url = `${API_BASE_URL}/files/${file.id}/download${token ? `?token=${token}` : ''}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
