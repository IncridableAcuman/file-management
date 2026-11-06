import React from 'react';
import { 
  FolderPlus, 
  UploadCloud, 
  Clock, 
  Sparkles, 
  Folder, 
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StorageOverview } from '@/components/files/StorageOverview';
import { FolderCard } from '@/components/files/FolderCard';
import { FileCard } from '@/components/files/FileCard';
import { FileRow } from '@/components/files/FileRow';
import { FileToolbar } from '@/components/files/FileToolbar';
import type { 
  FileCategory, 
  FileItem, 
  FolderItem, 
  SortField, 
  SortOrder, 
  StorageStats, 
  ViewMode 
} from '@/types/file';

interface DashboardPageProps {
  storageStats: StorageStats;
  folders: FolderItem[];
  files: FileItem[];
  selectedFileIds: string[];
  onSelectFile: (id: string, selected: boolean) => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkDownload: () => void;
  currentCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onOpenFolder: (folderId: string) => void;
  onRenameFolder: (folder: FolderItem) => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleFavoriteFolder: (folderId: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onDetailsFile: (file: FileItem) => void;
  onRenameFile: (file: FileItem) => void;
  onShareFile: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onToggleFavoriteFile: (fileId: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  storageStats,
  folders,
  files,
  selectedFileIds,
  onSelectFile,
  onDeselectAll,
  onBulkDelete,
  onBulkDownload,
  currentCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortChange,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onToggleFavoriteFolder,
  onPreviewFile,
  onDetailsFile,
  onRenameFile,
  onShareFile,
  onDeleteFile,
  onToggleFavoriteFile,
  onOpenUpload,
  onOpenNewFolder,
}) => {
  const rootFolders = folders.filter((f) => !f.parentId && !f.isTrashed);
  const activeFiles = files.filter((f) => !f.isTrashed);

  // Recent files (top 4 latest updated)
  const recentFiles = [...activeFiles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Storage Overview Analytics */}
      <StorageOverview
        stats={storageStats}
        onSelectCategory={onSelectCategory}
      />

      {/* 2. Quick Access / Recent Files */}
      {recentFiles.length > 0 && currentCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-blue-500" />
              <span>Recent Activity</span>
            </h3>
            <span className="text-xs text-muted-foreground font-medium">
              Quick access to your latest files
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFileIds.includes(file.id)}
                onSelect={onSelectFile}
                onPreview={onPreviewFile}
                onDetails={onDetailsFile}
                onRename={onRenameFile}
                onShare={onShareFile}
                onDelete={onDeleteFile}
                onToggleFavorite={onToggleFavoriteFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* 3. Folders Section */}
      {rootFolders.length > 0 && currentCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Folder className="size-4 text-indigo-500" />
              <span>Folders</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenNewFolder}
              className="text-xs gap-1.5 text-muted-foreground hover:text-foreground h-8"
            >
              <FolderPlus className="size-3.5" />
              <span>New Folder</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {rootFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={onOpenFolder}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
                onToggleFavorite={onToggleFavoriteFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Files Section with Filter Toolbar */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-emerald-500" />
            <span>Files Explorer</span>
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenUpload}
              className="h-8 text-xs gap-1.5 rounded-xl border-dashed"
            >
              <UploadCloud className="size-3.5 text-blue-500" />
              <span>Upload</span>
            </Button>
          </div>
        </div>

        <FileToolbar
          currentCategory={currentCategory}
          onSelectCategory={onSelectCategory}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
          selectedCount={selectedFileIds.length}
          totalCount={activeFiles.length}
          onDeselectAll={onDeselectAll}
          onBulkDelete={onBulkDelete}
          onBulkDownload={onBulkDownload}
        />

        {activeFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border border-dashed border-border/80 bg-muted/20">
            <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <UploadCloud className="size-7" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">No files found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Upload files or drop them anywhere on the dashboard to get started.
            </p>
            <Button
              size="sm"
              onClick={onOpenUpload}
              className="mt-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Upload Now
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                isSelected={selectedFileIds.includes(file.id)}
                onSelect={onSelectFile}
                onPreview={onPreviewFile}
                onDetails={onDetailsFile}
                onRename={onRenameFile}
                onShare={onShareFile}
                onDelete={onDeleteFile}
                onToggleFavorite={onToggleFavoriteFile}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                  <tr>
                    <th className="w-10 px-3 py-3"></th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3 hidden md:table-cell">Owner</th>
                    <th className="px-3 py-3">Size</th>
                    <th className="px-3 py-3 hidden sm:table-cell">Modified</th>
                    <th className="w-10 px-2 py-3 text-center">⭐</th>
                    <th className="w-12 px-3 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeFiles.map((file) => (
                    <FileRow
                      key={file.id}
                      file={file}
                      isSelected={selectedFileIds.includes(file.id)}
                      onSelect={onSelectFile}
                      onPreview={onPreviewFile}
                      onDetails={onDetailsFile}
                      onRename={onRenameFile}
                      onShare={onShareFile}
                      onDelete={onDeleteFile}
                      onToggleFavorite={onToggleFavoriteFile}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
