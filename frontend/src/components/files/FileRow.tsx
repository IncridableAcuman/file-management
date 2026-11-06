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
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getFileMeta, formatBytes, formatDate, downloadMockFile } from '@/lib/fileUtils';
import type { FileItem } from '@/types/file';

interface FileRowProps {
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

export const FileRow: React.FC<FileRowProps> = ({
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
    <tr
      onClick={() => onPreview(file)}
      className={`group border-b border-border/40 transition-colors cursor-pointer select-none ${
        isSelected
          ? 'bg-blue-500/[0.05] hover:bg-blue-500/[0.08]'
          : 'hover:bg-muted/40'
      }`}
    >
      {/* Checkbox */}
      <td
        onClick={(e) => e.stopPropagation()}
        className="w-10 px-3 py-3"
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(file.id, !!checked)}
          aria-label={`Select ${file.name}`}
        />
      </td>

      {/* Name & Icon */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${meta.badgeBg} ${meta.color}`}>
            <IconComponent className="size-4.5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate max-w-xs md:max-w-md">
              {file.name}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase font-mono">
              {file.extension || 'file'}
            </span>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-3 py-3 hidden md:table-cell text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="size-5 rounded-full bg-blue-600/20 text-blue-600 font-bold text-[9px] flex items-center justify-center">
            {file.owner.name[0]}
          </div>
          <span className="truncate max-w-[120px]">{file.owner.name}</span>
        </div>
      </td>

      {/* Size */}
      <td className="px-3 py-3 text-xs text-muted-foreground font-mono">
        {formatBytes(file.size)}
      </td>

      {/* Modified date */}
      <td className="px-3 py-3 hidden sm:table-cell text-xs text-muted-foreground">
        {formatDate(file.updatedAt)}
      </td>

      {/* Favorite Star */}
      <td
        onClick={(e) => e.stopPropagation()}
        className="px-2 py-3 w-10 text-center"
      >
        {!isTrashedView && (
          <button
            onClick={() => onToggleFavorite(file.id)}
            className="p-1 rounded text-muted-foreground hover:text-amber-500 transition-colors"
          >
            <Star
              className={`size-3.5 ${
                file.isFavorite ? 'fill-amber-400 text-amber-500' : 'opacity-0 group-hover:opacity-100'
              }`}
            />
          </button>
        )}
      </td>

      {/* Actions */}
      <td
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-3 w-12 text-right"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors">
              <MoreVertical className="size-4" />
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
                  <span>Details</span>
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
      </td>
    </tr>
  );
};
