import React from 'react';
import { 
  Download, 
  Share2, 
  Star, 
  Calendar, 
  User, 
  HardDrive, 
  Tag
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
import type { FileItem } from '@/types/file';

interface FilePreviewModalProps {
  file: FileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (file: FileItem) => void;
  onToggleFavorite: (fileId: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  open,
  onOpenChange,
  onShare,
  onToggleFavorite,
}) => {
  if (!file) return null;

  const meta = getFileMeta(file.name, file.mimeType);
  const IconComponent = meta.icon;

  const handleDownload = () => {
    downloadMockFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${meta.badgeBg} ${meta.color}`}>
              <IconComponent className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground truncate max-w-sm">
                {file.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] uppercase font-mono px-1.5 py-0">
                  {file.extension || 'file'}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatBytes(file.size)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mr-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(file.id)}
              className="size-8 rounded-lg"
              title="Favorite"
            >
              <Star
                className={`size-4 ${
                  file.isFavorite ? 'fill-amber-400 text-amber-500' : 'text-muted-foreground'
                }`}
              />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShare(file)}
              className="h-8 gap-1.5 text-xs rounded-xl"
            >
              <Share2 className="size-3.5" />
              <span>Share</span>
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="h-8 gap-1.5 text-xs rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              <Download className="size-3.5" />
              <span>Download</span>
            </Button>
          </div>
        </div>

        {/* Content Preview Area */}
        <div className="flex flex-col items-center justify-center min-h-[280px] max-h-[420px] bg-background/50 p-6 overflow-auto">
          {file.thumbnailUrl ? (
            <img
              src={file.thumbnailUrl}
              alt={file.name}
              className="max-h-[360px] w-auto rounded-xl object-contain shadow-md"
            />
          ) : meta.category === 'code' ? (
            <div className="w-full rounded-2xl bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto shadow-inner">
              <pre className="text-emerald-400">// {file.name} - Configuration & Schema</pre>
              <pre className="text-slate-400 mt-2">{`{\n  "version": "2.4.0",\n  "environment": "production",\n  "database": {\n    "cluster": "aws-east-1",\n    "ssl": true\n  }\n}`}</pre>
            </div>
          ) : meta.category === 'documents' ? (
            <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
              <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
                <IconComponent className="size-8" />
              </div>
              <h4 className="font-semibold text-sm mb-1">{file.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {file.description || 'Document preview is secured and ready for online reading.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className={`size-16 rounded-2xl ${meta.badgeBg} ${meta.color} flex items-center justify-center mb-4`}>
                <IconComponent className="size-8" />
              </div>
              <h4 className="font-semibold text-sm mb-1">{file.name}</h4>
              <p className="text-xs text-muted-foreground">
                Binary media asset • {formatBytes(file.size)}
              </p>
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border/60 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                <User className="size-3" /> Owner
              </span>
              <p className="font-medium text-foreground truncate">{file.owner.name}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3" /> Modified
              </span>
              <p className="font-medium text-foreground truncate">{formatDate(file.updatedAt)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                <HardDrive className="size-3" /> Size
              </span>
              <p className="font-medium text-foreground">{formatBytes(file.size)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground flex items-center gap-1">
                <Tag className="size-3" /> Tags
              </span>
              <div className="flex flex-wrap gap-1">
                {(file.tags || ['Document']).map((t, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9px] py-0 px-1">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
