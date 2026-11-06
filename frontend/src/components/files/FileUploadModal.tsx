import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { formatBytes } from '@/lib/fileUtils';
import type { FolderItem } from '@/types/file';

interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: FolderItem[];
  currentFolderId: string | null;
  onUpload: (
    files: Array<{ file?: File; name: string; size: number; mimeType: string; previewUrl?: string }>,
    folderId: string | null
  ) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  open,
  onOpenChange,
  folders,
  currentFolderId,
  onUpload,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(currentFolderId);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFilesToUpload((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      setFilesToUpload((prev) => [...prev, ...selected]);
    }
    // Reset input value so re-selecting the same file works correctly
    e.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setFilesToUpload((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = () => {
    if (filesToUpload.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadProgress(10);

    const filesCopy = [...filesToUpload];
    let current = 10;
    const interval = setInterval(() => {
      current += 25;
      if (current >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          const prepared = filesCopy.map((f) => ({
            file: f,
            name: f.name,
            size: f.size,
            mimeType: f.type || 'application/octet-stream',
            previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
          }));
          onUpload(prepared, selectedFolderId);
          setIsUploading(false);
          setUploadProgress(0);
          setFilesToUpload([]);
          onOpenChange(false);
        }, 300);
      } else {
        setUploadProgress(current);
      }
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-bold text-foreground">
            Upload Files
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Select or drag and drop documents, images or media files.
          </p>
        </DialogHeader>

        {/* Drag and Drop Box */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-500/10 scale-[1.01]'
              : 'border-border/80 hover:border-blue-500/50 hover:bg-muted/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-3">
            <UploadCloud className="size-7" />
          </div>
          <p className="text-xs font-semibold text-foreground text-center">
            Click to upload or drag & drop files here
          </p>
          <p className="text-[11px] text-muted-foreground text-center mt-1">
            Support for PDF, Images, Video, Zip, Code up to 2GB per file
          </p>
        </div>

        {/* Folder Destination Selector */}
        <div className="space-y-1.5 mt-2">
          <label className="text-xs font-medium text-foreground">
            Save destination:
          </label>
          <select
            value={selectedFolderId || ''}
            onChange={(e) => setSelectedFolderId(e.target.value || null)}
            className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Root (My Files)</option>
            {folders
              .filter((f) => !f.isTrashed)
              .map((folder) => (
                <option key={folder.id} value={folder.id}>
                  📁 {folder.name}
                </option>
              ))}
          </select>
        </div>

        {/* Selected Files List */}
        {filesToUpload.length > 0 && (
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Selected items ({filesToUpload.length})</span>
              <span>
                {formatBytes(filesToUpload.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>
            {filesToUpload.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-muted/50 border border-border/50 text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="size-4 text-blue-500 shrink-0" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    ({formatBytes(file.size)})
                  </span>
                </div>
                {!isUploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(idx);
                    }}
                    className="p-1 rounded text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress Bar during upload */}
        {isUploading && (
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400">Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2 rounded-full" />
          </div>
        )}

        <DialogFooter className="mt-4 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={filesToUpload.length === 0 || isUploading}
            onClick={handleStartUpload}
            className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isUploading ? 'Uploading...' : `Upload ${filesToUpload.length} Files`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
