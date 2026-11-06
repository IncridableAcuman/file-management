import React from 'react';
import { Clock } from 'lucide-react';
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

interface RecentPageProps {
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

export const RecentPage: React.FC<RecentPageProps> = ({
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
  // Sort files strictly by updatedAt descending
  const recentFiles = [...files.filter((f) => !f.isTrashed)].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Clock className="size-5 text-blue-500" />
            <span>Recent Files</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Chronological log of files opened, edited or uploaded recently.
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
        totalCount={recentFiles.length}
        onDeselectAll={onDeselectAll}
        onBulkDelete={onBulkDelete}
        onBulkDownload={onBulkDownload}
      />

      {recentFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
            <Clock className="size-7" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">No recent activity</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Files you interact with will show up here sorted by recency.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                {recentFiles.map((file) => (
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
