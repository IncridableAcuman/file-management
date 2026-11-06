import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Mail, 
  Globe, 
  Lock, 
  UserCheck 
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { FileItem } from '@/types/file';

interface FileShareModalProps {
  file: FileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (fileId: string, email: string, role: 'viewer' | 'editor') => void;
}

export const FileShareModal: React.FC<FileShareModalProps> = ({
  file,
  open,
  onOpenChange,
  onShare,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [copied, setCopied] = useState(false);

  if (!file) return null;

  const shareUrl = `${window.location.origin}/share/${file.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    onShare(file.id, email.trim(), role);
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Share2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Share "{file.name}"
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Give team members access or create a public link.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Invite by Email */}
        <form onSubmit={handleAddCollaborator} className="space-y-3 pt-2">
          <label className="text-xs font-semibold text-foreground">
            Invite by Email
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 h-10 rounded-xl text-xs"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
              className="h-10 rounded-xl border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <Button
              type="submit"
              disabled={!email.trim()}
              className="h-10 px-4 rounded-xl text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              Invite
            </Button>
          </div>
        </form>

        {/* Existing Collaborators */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold text-foreground">
            People with access
          </span>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {/* Owner */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs">
              <div className="flex items-center gap-2 truncate">
                <div className="size-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {file.owner.name[0]}
                </div>
                <div className="truncate">
                  <p className="font-semibold text-foreground truncate">{file.owner.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{file.owner.email}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px]">Owner</Badge>
            </div>

            {/* Shared users */}
            {file.sharedWith?.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <div className="size-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center">
                    {s.email[0].toUpperCase()}
                  </div>
                  <span className="truncate text-foreground font-medium">{s.email}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] capitalize">{s.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Public Link Share */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-blue-500" />
              General Access
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Lock className="size-3" /> Anyone with the link
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="h-9 rounded-xl text-xs font-mono bg-muted/50 text-muted-foreground"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-3 gap-1.5 rounded-xl text-xs font-semibold shrink-0"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl text-xs"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
