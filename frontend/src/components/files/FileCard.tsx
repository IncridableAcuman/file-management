import React from 'react';
import { 
  MoreVertical, 
  Star, 
  Download, 
  Share2, 
  Edit2, 
  Trash2, 
  Eye, 
  Info,
  RotateCcw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { getFileMeta, formatBytes, formatRelativeTime, downloadMockFile } from '@/lib/fileUtils';
import type { FileItem } from '@/types/file';

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: (fileId: string, selected: boolean) => void;
  onPreview: (file: FileItem) => void;
  onDetails: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onDelete: (fileId: string) => void;
  onToggleFavorite: (fileId: string) => void;
  isTrashedView?: boolean;
  onRestore?: (fileId: string) => void;
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected,
  onSelect,
  onPreview,
  onDetails,
  onRename,
  onShare,
  onDelete,
  onToggleFavorite,
  isTrashedView = false,
  onRestore,
}) => {
  const meta = getFileMeta(file.name, file.mimeType);
  const IconComponent = meta.icon;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    downloadMockFile(file);
  };

  return (
    <div
      onClick={() => onPreview(file)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
        isSelected
          ? 'border-blue-500 bg-blue-500/[0.03] ring-2 ring-blue-500/20 shadow-md'
          : 'border-border/70 bg-card hover:-translate-y-1 hover:border-border hover:shadow-lg hover:shadow-primary/5'
      }`}
    >
      {/* Top Banner / Preview Area */}
      <div className="relative flex h-36 w-full items-center justify-center overflow-hidden bg-muted/40 border-b border-border/40">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className={`p-4 rounded-2xl ${meta.badgeBg} ${meta.color} transition-transform group-hover:scale-110 duration-200`}>
              <IconComponent className="size-8" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {file.extension || 'file'}
            </span>
          </div>
        )}

        {/* Top Floating Controls: Checkbox & Quick Actions */}
        <div className="absolute inset-x-2 top-2 flex items-center justify-between">
          {/* Checkbox */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`transition-opacity ${
              isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            <div className="rounded-md bg-background/80 backdrop-blur-md p-1 shadow-xs border border-border/60">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect(file.id, !!checked)}
                aria-label={`Select ${file.name}`}
              />
            </div>
          </div>

          {/* Fav & More menu */}
          <div className="flex items-center gap-1">
            {!isTrashedView && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(file.id);
                }}
                className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
                  file.isFavorite
                    ? 'bg-background/90 text-amber-500 shadow-xs'
                    : 'bg-background/70 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-amber-500 hover:bg-background'
                }`}
                title={file.isFavorite ? 'Remove from Starred' : 'Add to Starred'}
              >
                <Star className={`size-3.5 ${file.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="p-1.5 rounded-lg bg-background/80 backdrop-blur-md text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-xs border border-border/40"
                >
                  <MoreVertical className="size-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
                {!isTrashedView ? (
                  <>
                    <DropdownMenuItem
                      onClick={() => onPreview(file)}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                    >
                      <Eye className="size-3.5 text-blue-500" />
                      <span>Preview</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDownload}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                    >
                      <Download className="size-3.5 text-emerald-500" />
                      <span>Download</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onShare(file)}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                    >
                      <Share2 className="size-3.5 text-purple-500" />
                      <span>Share</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onRename(file)}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                    >
                      <Edit2 className="size-3.5 text-muted-foreground" />
                      <span>Rename</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDetails(file)}
                      className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg"
                    >
                      <Info className="size-3.5 text-muted-foreground" />
                      <span>Details & Info</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(file.id)}
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
                        onClick={() => onRestore(file.id)}
                        className="flex items-center gap-2 text-xs py-2 cursor-pointer rounded-lg text-emerald-600 dark:text-emerald-400"
                      >
                        <RotateCcw className="size-3.5" />
                        <span>Restore File</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(file.id)}
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
      </div>

      {/* Card Body: Info */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4
            title={file.name}
            className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors"
          >
            {file.name}
          </h4>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          <span>{formatRelativeTime(file.updatedAt)}</span>
        </div>

        {file.sharedWith && file.sharedWith.length > 0 && (
          <div className="flex items-center gap-1 pt-1 border-t border-border/40">
            <span className="text-[10px] text-muted-foreground">Shared with:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {file.sharedWith.map((s, idx) => (
                <div
                  key={idx}
                  title={s.email}
                  className="flex size-4 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white ring-1 ring-card"
                >
                  {s.email[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
