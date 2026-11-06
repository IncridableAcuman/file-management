import React, { useState, useEffect } from 'react';
import { Edit3 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FileItem, FolderItem } from '@/types/file';

interface FileRenameModalProps {
  item: FileItem | FolderItem | null;
  isFolder: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (id: string, newName: string, isFolder: boolean) => void;
}

export const FileRenameModal: React.FC<FileRenameModalProps> = ({
  item,
  isFolder,
  open,
  onOpenChange,
  onRename,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    if (item) {
      if (!isFolder && 'extension' in item && item.extension) {
        // Strip extension for friendly editing
        const baseName = item.name.replace(new RegExp(`\\.${item.extension}$`, 'i'), '');
        setName(baseName);
      } else {
        setName(item.name);
      }
    }
  }, [item, isFolder]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onRename(item.id, name.trim(), isFolder);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Edit3 className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Rename {isFolder ? 'Folder' : 'File'}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Enter a new name for this {isFolder ? 'folder' : 'file'}.
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              New Name
            </label>
            <Input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-xl text-sm"
            />
          </div>

          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
