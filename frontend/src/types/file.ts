export type FileCategory = 
  | 'all' 
  | 'documents' 
  | 'images' 
  | 'videos' 
  | 'audio' 
  | 'archives' 
  | 'code' 
  | 'other';

export type FileType = 
  | 'pdf' 
  | 'doc' 
  | 'docx' 
  | 'xls' 
  | 'xlsx' 
  | 'ppt' 
  | 'pptx' 
  | 'png' 
  | 'jpg' 
  | 'jpeg' 
  | 'gif' 
  | 'svg' 
  | 'webp' 
  | 'mp4' 
  | 'mkv' 
  | 'mp3' 
  | 'wav' 
  | 'zip' 
  | 'rar' 
  | 'tar' 
  | 'js' 
  | 'ts' 
  | 'json' 
  | 'html' 
  | 'css' 
  | 'txt' 
  | 'md' 
  | 'other';

export interface FileItem {
  id: string;
  name: string;
  extension: string;
  category: FileCategory;
  mimeType: string;
  size: number; // in bytes
  folderId: string | null;
  isFavorite: boolean;
  isTrashed: boolean;
  trashedAt?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number | string;
    name: string;
    email: string;
    avatar?: string;
  };
  sharedWith?: Array<{
    email: string;
    role: 'viewer' | 'editor';
    addedAt: string;
  }>;
  url?: string;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  color?: string;
  isFavorite?: boolean;
  isTrashed?: boolean;
  trashedAt?: string;
  fileCount?: number;
  totalSize?: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: number | string;
    name: string;
    email: string;
  };
}

export interface StorageCategoryStat {
  category: FileCategory;
  label: string;
  size: number;
  fileCount: number;
  color: string;
  accentBg: string;
}

export interface StorageStats {
  total: number; // e.g. 100 GB in bytes
  used: number;
  categories: StorageCategoryStat[];
}

export type SortField = 'name' | 'updatedAt' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list';
