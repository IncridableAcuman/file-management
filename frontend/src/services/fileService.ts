import { INITIAL_FILES, INITIAL_FOLDERS } from './mockData';
import type { 
  FileCategory, 
  FileItem, 
  FolderItem, 
  StorageStats 
} from '@/types/file';
import { detectCategory } from '@/lib/fileUtils';

const STORAGE_KEY_FILES = 'fms_files_v1';
const STORAGE_KEY_FOLDERS = 'fms_folders_v1';

class FileService {
  private getFilesFromStorage(): FileItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(INITIAL_FILES));
      return INITIAL_FILES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FILES;
    }
  }

  private saveFilesToStorage(files: FileItem[]): void {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(files));
  }

  private getFoldersFromStorage(): FolderItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_FOLDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(INITIAL_FOLDERS));
      return INITIAL_FOLDERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_FOLDERS;
    }
  }

  private saveFoldersToStorage(folders: FolderItem[]): void {
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
  }

  public getFiles(): FileItem[] {
    return this.getFilesFromStorage();
  }

  public getFolders(): FolderItem[] {
    return this.getFoldersFromStorage();
  }

  public getFolderById(id: string): FolderItem | undefined {
    return this.getFolders().find(f => f.id === id);
  }

  public getFileById(id: string): FileItem | undefined {
    return this.getFiles().find(f => f.id === id);
  }

  public createFolder(name: string, parentId: string | null = null, color = '#3b82f6'): FolderItem {
    const folders = this.getFolders();
    const newFolder: FolderItem = {
      id: `folder-${Date.now()}`,
      name: name.trim(),
      parentId,
      color,
      isFavorite: false,
      isTrashed: false,
      fileCount: 0,
      totalSize: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' }
    };
    folders.unshift(newFolder);
    this.saveFoldersToStorage(folders);
    return newFolder;
  }

  public uploadFile(
    file: { name: string; size: number; mimeType?: string },
    folderId: string | null = null,
    thumbnailUrl?: string
  ): FileItem {
    const files = this.getFiles();
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const category = detectCategory(file.name);

    const newFile: FileItem = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      extension,
      category,
      mimeType: file.mimeType || 'application/octet-stream',
      size: file.size,
      folderId,
      isFavorite: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
      thumbnailUrl: thumbnailUrl || (category === 'images' ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' : undefined),
      tags: ['Uploaded']
    };

    files.unshift(newFile);
    this.saveFilesToStorage(files);

    // Update folder stats
    if (folderId) {
      this.recalculateFolderStats(folderId);
    }

    return newFile;
  }

  public toggleFavorite(id: string, isFolder: boolean = false): void {
    if (isFolder) {
      const folders = this.getFolders();
      const folder = folders.find(f => f.id === id);
      if (folder) {
        folder.isFavorite = !folder.isFavorite;
        folder.updatedAt = new Date().toISOString();
        this.saveFoldersToStorage(folders);
      }
    } else {
      const files = this.getFiles();
      const file = files.find(f => f.id === id);
      if (file) {
        file.isFavorite = !file.isFavorite;
        file.updatedAt = new Date().toISOString();
        this.saveFilesToStorage(files);
      }
    }
  }

  public renameItem(id: string, newName: string, isFolder: boolean = false): void {
    if (isFolder) {
      const folders = this.getFolders();
      const folder = folders.find(f => f.id === id);
      if (folder) {
        folder.name = newName.trim();
        folder.updatedAt = new Date().toISOString();
        this.saveFoldersToStorage(folders);
      }
    } else {
      const files = this.getFiles();
      const file = files.find(f => f.id === id);
      if (file) {
        const ext = file.extension ? `.${file.extension}` : '';
        file.name = newName.trim().endsWith(ext) ? newName.trim() : `${newName.trim()}${ext}`;
        file.updatedAt = new Date().toISOString();
        this.saveFilesToStorage(files);
      }
    }
  }

  public moveToTrash(id: string, isFolder: boolean = false): void {
    if (isFolder) {
      const folders = this.getFolders();
      const folder = folders.find(f => f.id === id);
      if (folder) {
        folder.isTrashed = true;
        folder.trashedAt = new Date().toISOString();
        this.saveFoldersToStorage(folders);
      }
    } else {
      const files = this.getFiles();
      const file = files.find(f => f.id === id);
      if (file) {
        file.isTrashed = true;
        file.trashedAt = new Date().toISOString();
        this.saveFilesToStorage(files);
      }
    }
  }

  public restoreFromTrash(id: string, isFolder: boolean = false): void {
    if (isFolder) {
      const folders = this.getFolders();
      const folder = folders.find(f => f.id === id);
      if (folder) {
        folder.isTrashed = false;
        folder.trashedAt = undefined;
        this.saveFoldersToStorage(folders);
      }
    } else {
      const files = this.getFiles();
      const file = files.find(f => f.id === id);
      if (file) {
        file.isTrashed = false;
        file.trashedAt = undefined;
        this.saveFilesToStorage(files);
      }
    }
  }

  public deletePermanently(id: string, isFolder: boolean = false): void {
    if (isFolder) {
      const folders = this.getFolders().filter(f => f.id !== id);
      this.saveFoldersToStorage(folders);
    } else {
      const files = this.getFiles().filter(f => f.id !== id);
      this.saveFilesToStorage(files);
    }
  }

  public emptyTrash(): void {
    const files = this.getFiles().filter(f => !f.isTrashed);
    const folders = this.getFolders().filter(f => !f.isTrashed);
    this.saveFilesToStorage(files);
    this.saveFoldersToStorage(folders);
  }

  public shareFile(id: string, email: string, role: 'viewer' | 'editor'): void {
    const files = this.getFiles();
    const file = files.find(f => f.id === id);
    if (file) {
      if (!file.sharedWith) file.sharedWith = [];
      file.sharedWith = file.sharedWith.filter(s => s.email !== email);
      file.sharedWith.push({
        email,
        role,
        addedAt: new Date().toISOString()
      });
      this.saveFilesToStorage(files);
    }
  }

  public getStorageStats(): StorageStats {
    const files = this.getFiles().filter(f => !f.isTrashed);
    const totalAllocated = 100 * 1024 * 1024 * 1024; // 100 GB

    const categoryMap: Record<FileCategory, { size: number; count: number; color: string; label: string; accentBg: string }> = {
      documents: { size: 0, count: 0, color: '#3b82f6', label: 'Documents', accentBg: 'bg-blue-500' },
      images: { size: 0, count: 0, color: '#f59e0b', label: 'Images', accentBg: 'bg-amber-500' },
      videos: { size: 0, count: 0, color: '#8b5cf6', label: 'Videos', accentBg: 'bg-purple-500' },
      audio: { size: 0, count: 0, color: '#f43f5e', label: 'Audio', accentBg: 'bg-rose-500' },
      archives: { size: 0, count: 0, color: '#f97316', label: 'Archives', accentBg: 'bg-orange-500' },
      code: { size: 0, count: 0, color: '#06b6d4', label: 'Code & Dev', accentBg: 'bg-cyan-500' },
      other: { size: 0, count: 0, color: '#64748b', label: 'Other', accentBg: 'bg-slate-500' },
      all: { size: 0, count: 0, color: '#3b82f6', label: 'All', accentBg: 'bg-blue-500' }
    };

    let totalUsed = 0;
    files.forEach(f => {
      totalUsed += f.size;
      const cat = f.category || 'other';
      if (categoryMap[cat]) {
        categoryMap[cat].size += f.size;
        categoryMap[cat].count += 1;
      }
    });

    const categories = Object.entries(categoryMap)
      .filter(([cat]) => cat !== 'all')
      .map(([cat, val]) => ({
        category: cat as FileCategory,
        label: val.label,
        size: val.size,
        fileCount: val.count,
        color: val.color,
        accentBg: val.accentBg
      }));

    return {
      total: totalAllocated,
      used: totalUsed,
      categories
    };
  }

  private recalculateFolderStats(folderId: string) {
    const files = this.getFiles().filter(f => f.folderId === folderId && !f.isTrashed);
    const folders = this.getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      folder.fileCount = files.length;
      folder.totalSize = files.reduce((acc, curr) => acc + curr.size, 0);
      folder.updatedAt = new Date().toISOString();
      this.saveFoldersToStorage(folders);
    }
  }

  public resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(INITIAL_FILES));
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(INITIAL_FOLDERS));
  }
}

export const fileService = new FileService();
