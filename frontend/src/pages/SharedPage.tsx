import React from 'react';
import { Users, Share2 } from 'lucide-react';
import { FileCard } from '@/components/files/FileCard';
import { FileRow } from '@/components/files/FileRow';
import { FileToolbar } from '@/components/files/FileToolbar';
import type { 
  FileCategory, 
  FileItem, 
  SortField, 
  SortOrder, 
  ViewMode 
} from '@/types/file';

interface SharedPageProps {
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
  onPreviewFile: (file: FileItem) => void;
  onDetailsFile: (file: FileItem) => void;
  onRenameFile: (file: FileItem) => void;
  onShareFile: (file: FileItem) => void;
  onDeleteFile: (fileId: string) => void;
  onToggleFavoriteFile: (fileId: string) => void;
}

export const SharedPage: React.FC<SharedPageProps> = ({
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
  onPreviewFile,
  onDetailsFile,
  onRenameFile,
  onShareFile,
  onDeleteFile,
  onToggleFavoriteFile,
}) => {
  // Shared files: files that have sharedWith array or owner id !== current user
  const sharedFiles = files.filter(
    (f) => !f.isTrashed && ((f.sharedWith && f.sharedWith.length > 0) || f.owner.id !== 1)
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="size-5 text-purple-500" />
            <span>Shared with me</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Collaborative documents and assets shared across team workspaces.
          </p>
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
        totalCount={sharedFiles.length}
        onDeselectAll={onDeselectAll}
        onBulkDelete={onBulkDelete}
        onBulkDownload={onBulkDownload}
      />

      {sharedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
            <Share2 className="size-7" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">No shared files yet</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            When teammates share folders or links with you, they will appear here automatically.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sharedFiles.map((file) => (
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
                {sharedFiles.map((file) => (
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
  );
};
