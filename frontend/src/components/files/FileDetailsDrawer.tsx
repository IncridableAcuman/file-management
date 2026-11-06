import React from 'react';
import { 
  X, 
  FileText, 
  Calendar, 
  HardDrive, 
  User, 
  Tag, 
  Share2, 
  Download, 
  Folder 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFileMeta, formatBytes, formatDate, downloadMockFile } from '@/lib/fileUtils';
import type { FileItem, FolderItem } from '@/types/file';

interface FileDetailsDrawerProps {
  file: FileItem | null;
  folders: FolderItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (file: FileItem) => void;
}

export const FileDetailsDrawer: React.FC<FileDetailsDrawerProps> = ({
  file,
  folders,
  open,
  onOpenChange,
  onShare,
}) => {
  if (!file) return null;

  const meta = getFileMeta(file.name, file.mimeType);
  const IconComponent = meta.icon;
  const parentFolder = folders.find((f) => f.id === file.folderId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${meta.badgeBg} ${meta.color}`}>
              <IconComponent className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground truncate max-w-xs">
                {file.name}
              </DialogTitle>
              <span className="text-xs text-muted-foreground uppercase font-mono">
                {file.extension || 'file'} • {formatBytes(file.size)}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Details list */}
        <div className="space-y-4 pt-2 divide-y divide-border/50 text-xs">
          <div className="pt-2 space-y-2">
            <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              File Properties
            </h5>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Type</span>
                <span className="font-semibold text-foreground capitalize">{file.category}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Size</span>
                <span className="font-semibold text-foreground font-mono">{formatBytes(file.size)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">MIME Type</span>
                <span className="font-semibold text-foreground truncate block font-mono text-[10px]">{file.mimeType}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40">
                <span className="text-muted-foreground block text-[10px]">Location</span>
                <span className="font-semibold text-foreground flex items-center gap-1 truncate">
                  <Folder className="size-3 text-blue-500" />
                  {parentFolder?.name || 'Root (My Files)'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Timeline & Ownership
            </h5>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5" /> Owner
                </span>
                <span className="font-semibold text-foreground">{file.owner.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Created At
                </span>
                <span className="font-mono text-muted-foreground">{formatDate(file.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5" /> Last Modified
                </span>
                <span className="font-mono text-muted-foreground">{formatDate(file.updatedAt)}</span>
              </div>
            </div>
          </div>

          {file.description && (
            <div className="pt-3 space-y-1">
              <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                Description
              </h5>
              <p className="text-muted-foreground leading-relaxed">
                {file.description}
              </p>
            </div>
          )}

          {file.tags && file.tags.length > 0 && (
            <div className="pt-3 space-y-1.5">
              <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
                Tags
              </h5>
              <div className="flex flex-wrap gap-1">
                {file.tags.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-[10px]">
                    #{t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
          <Button
            variant="outline"
            onClick={() => onShare(file)}
            className="flex-1 rounded-xl text-xs gap-1.5"
          >
            <Share2 className="size-3.5 text-purple-500" />
            <span>Share</span>
          </Button>
          <Button
            onClick={() => downloadMockFile(file)}
            className="flex-1 rounded-xl text-xs gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Download className="size-3.5" />
            <span>Download</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
