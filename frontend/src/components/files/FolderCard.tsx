import React from 'react';
import { 
  Folder, 
  MoreVertical, 
  Star, 
  Trash2, 
  Edit2, 
  FolderOpen
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBytes } from '@/lib/fileUtils';
import type { FolderItem } from '@/types/file';

interface FolderCardProps {
  folder: FolderItem;
  onOpen: (folderId: string) => void;
  onRename: (folder: FolderItem) => void;
  onDelete: (folderId: string) => void;
  onToggleFavorite: (folderId: string) => void;
  isTrashedView?: boolean;
  onRestore?: (folderId: string) => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  onOpen,
  onRename,
  onDelete,
  onToggleFavorite,
  isTrashedView = false,
  onRestore,
}) => {
  const folderColor = folder.color || '#3b82f6';

  return (
    <div
      onDoubleClick={() => !isTrashedView && onOpen(folder.id)}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-border hover:shadow-lg hover:shadow-primary/5 select-none cursor-pointer"
    >
      {/* Top Header: Icon + Fav + Menu */}
      <div className="flex items-start justify-between gap-2">
        <div 
          onClick={() => !isTrashedView && onOpen(folder.id)}
          className="flex size-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
          style={{ backgroundColor: `${folderColor}15`, color: folderColor }}
        >
          <Folder className="size-6 fill-current" />
        </div>

        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {!isTrashedView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(folder.id);
              }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-muted/80 transition-colors"
              title={folder.isFavorite ? 'Remove from Starred' : 'Add to Starred'}
            >
              <Star
                className={`size-4 ${
                  folder.isFavorite ? 'fill-amber-400 text-amber-500' : ''
                }`}
              />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 p-1 rounded-xl">
              {!isTrashedView ? (
                <>
                  <DropdownMenuItem
                    onClick={() => onOpen(folder.id)}
                    className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                  >
                    <FolderOpen className="size-3.5 text-blue-500" />
                    <span>Open Folder</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onRename(folder)}
                    className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                  >
                    <Edit2 className="size-3.5 text-muted-foreground" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(folder.id)}
                    className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Move to Trash</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  {onRestore && (
                    <DropdownMenuItem
                      onClick={() => onRestore(folder.id)}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg text-emerald-600 dark:text-emerald-400"
                    >
                      <span>Restore Folder</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete(folder.id)}
                    className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Permanently</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Folder Name & Info */}
      <div 
        onClick={() => !isTrashedView && onOpen(folder.id)}
        className="mt-4 space-y-1"
      >
        <h4 className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
          {folder.name}
        </h4>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{folder.fileCount || 0} files</span>
          <span>{formatBytes(folder.totalSize || 0)}</span>
        </div>
      </div>
    </div>
  );
};
