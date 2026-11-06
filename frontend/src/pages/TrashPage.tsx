import React from 'react';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FolderCard } from '@/components/files/FolderCard';
import { FileCard } from '@/components/files/FileCard';
import { FileRow } from '@/components/files/FileRow';
import type { FileItem, FolderItem, ViewMode } from '@/types/file';

interface TrashPageProps {
  folders: FolderItem[];
  files: FileItem[];
  viewMode: ViewMode;
  onEmptyTrash: () => void;
  onRestoreFolder: (folderId: string) => void;
  onDeleteFolderPermanently: (folderId: string) => void;
  onRestoreFile: (fileId: string) => void;
  onDeleteFilePermanently: (fileId: string) => void;
  onPreviewFile: (file: FileItem) => void;
  onDetailsFile: (file: FileItem) => void;
}

export const TrashPage: React.FC<TrashPageProps> = ({
  folders,
  files,
  viewMode,
  onEmptyTrash,
  onRestoreFolder,
  onDeleteFolderPermanently,
  onRestoreFile,
  onDeleteFilePermanently,
  onPreviewFile,
  onDetailsFile,
}) => {
  const trashedFolders = folders.filter((f) => f.isTrashed);
  const trashedFiles = files.filter((f) => f.isTrashed);
  const hasItems = trashedFolders.length > 0 || trashedFiles.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Trash2 className="size-5 text-rose-500" />
            <span>Trash / Recycle Bin</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Items in trash will be automatically purged after 30 days.
          </p>
        </div>

        {hasItems && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onEmptyTrash}
            className="h-8 text-xs gap-1.5 rounded-xl font-medium"
          >
            <Trash2 className="size-3.5" />
            <span>Empty Trash</span>
          </Button>
        )}
      </div>

      {!hasItems ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-dashed border-border/80 bg-muted/20">
          <div className="size-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
            <Trash2 className="size-7" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Trash is empty</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Deleted files and folders will stay here until you restore or purge them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Trashed Folders */}
          {trashedFolders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Deleted Folders ({trashedFolders.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {trashedFolders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    isTrashedView={true}
                    onOpen={() => {}}
                    onRename={() => {}}
                    onDelete={onDeleteFolderPermanently}
                    onToggleFavorite={() => {}}
                    onRestore={onRestoreFolder}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trashed Files */}
          {trashedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Deleted Files ({trashedFiles.length})
              </h4>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {trashedFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      isTrashedView={true}
                      isSelected={false}
                      onSelect={() => {}}
                      onPreview={onPreviewFile}
                      onDetails={onDetailsFile}
                      onRename={() => {}}
                      onShare={() => {}}
                      onDelete={onDeleteFilePermanently}
                      onToggleFavorite={() => {}}
                      onRestore={onRestoreFile}
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
                          <th className="w-10 px-2 py-3 text-center"></th>
                          <th className="w-12 px-3 py-3 text-right"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {trashedFiles.map((file) => (
                          <FileRow
                            key={file.id}
                            file={file}
                            isTrashedView={true}
                            isSelected={false}
                            onSelect={() => {}}
                            onPreview={onPreviewFile}
                            onDetails={onDetailsFile}
                            onRename={() => {}}
                            onShare={() => {}}
                            onDelete={onDeleteFilePermanently}
                            onToggleFavorite={() => {}}
                            onRestore={onRestoreFile}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
