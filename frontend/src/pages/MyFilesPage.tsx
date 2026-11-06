import React from 'react';
import { 
  FolderPlus, 
  UploadCloud, 
  ChevronRight, 
  Folder, 
  Home, 
  ArrowLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  ViewMode 
} from '@/types/file';

interface MyFilesPageProps {
  currentFolderId: string | null;
  onNavigateFolder: (folderId: string | null) => void;
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

export const MyFilesPage: React.FC<MyFilesPageProps> = ({
  currentFolderId,
  onNavigateFolder,
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
  const currentFolder = folders.find((f) => f.id === currentFolderId);

  // Subfolders for this level
  const subFolders = folders.filter(
    (f) => f.parentId === currentFolderId && !f.isTrashed
  );

  // Files in this level
  const currentFiles = files.filter(
    (f) => f.folderId === currentFolderId && !f.isTrashed
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="flex items-center gap-1.5 flex-wrap text-sm font-semibold">
          <button
            onClick={() => onNavigateFolder(null)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors ${
              !currentFolderId
                ? 'bg-primary/10 text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Home className="size-4" />
            <span>My Files</span>
          </button>

          {currentFolder && (
            <>
              <ChevronRight className="size-4 text-muted-foreground" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-bold">
                <Folder className="size-4 fill-current" />
                <span>{currentFolder.name}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentFolderId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateFolder(currentFolder?.parentId || null)}
              className="h-8 text-xs gap-1.5 rounded-xl"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNewFolder}
            className="h-8 text-xs gap-1.5 rounded-xl"
          >
            <FolderPlus className="size-3.5 text-indigo-500" />
            <span>New Folder</span>
          </Button>
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="h-8 text-xs gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <UploadCloud className="size-3.5" />
            <span>Upload Files</span>
          </Button>
        </div>
      </div>

      {/* Subfolders if any */}
      {subFolders.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Folders ({subFolders.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {subFolders.map((folder) => (
              <FolderCard
                key={folder.id}
                folder={folder}
                onOpen={(id) => onNavigateFolder(id)}
                onRename={onRenameFolder}
                onDelete={onDeleteFolder}
                onToggleFavorite={onToggleFavoriteFolder}
              />
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-4">
        <FileToolbar
          currentCategory={currentCategory}
          onSelectCategory={onSelectCategory}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          sortField={sortField}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
          selectedCount={selectedFileIds.length}
          totalCount={currentFiles.length}
          onDeselectAll={onDeselectAll}
          onBulkDelete={onBulkDelete}
          onBulkDownload={onBulkDownload}
        />

        {currentFiles.length === 0 && subFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border/80 bg-muted/20">
            <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <FolderPlus className="size-7" />
            </div>
            <h4 className="font-semibold text-sm text-foreground">This folder is empty</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Upload your documents or create subfolders to organize your files.
            </p>
            <Button
              size="sm"
              onClick={onOpenUpload}
              className="mt-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Upload Here
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentFiles.map((file) => (
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
                  {currentFiles.map((file) => (
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
