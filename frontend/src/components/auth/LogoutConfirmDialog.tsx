import React, { useState } from 'react';
import { LogOut, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmLogout: () => Promise<void> | void;
}

export const LogoutConfirmDialog: React.FC<LogoutConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirmLogout,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    // Smooth transition with elegant animation
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await onConfirmLogout();
    } finally {
      setIsLoggingOut(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoggingOut && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md p-6 rounded-3xl border-border/80 shadow-2xl">
        {isLoggingOut ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
              <div className="size-16 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <LogOut className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-foreground">
                Signing out securely...
              </h3>
              <p className="text-xs text-muted-foreground">
                Encrypting local session and clearing cached credentials.
              </p>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader className="space-y-3">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mx-auto sm:mx-0">
                <LogOut className="size-6 stroke-[2.2]" />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <DialogTitle className="text-lg font-bold text-foreground">
                  Sign out of FileVault?
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to log out? Your uploaded files, folders and active preferences are securely saved in the cloud.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="p-3 rounded-2xl bg-muted/40 border border-border/50 text-xs flex items-center gap-2.5 text-muted-foreground my-2">
              <ShieldCheck className="size-4 text-emerald-500 shrink-0" />
              <span>Zero data loss: All ongoing synchronizations are finished.</span>
            </div>

            <DialogFooter className="mt-4 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isLoggingOut}
                onClick={() => onOpenChange(false)}
                className="rounded-xl text-xs flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={isLoggingOut}
                onClick={handleLogout}
                className="rounded-xl text-xs flex-1 sm:flex-none font-semibold gap-1.5 shadow-md shadow-destructive/20"
              >
                <LogOut className="size-3.5" />
                <span>Yes, Sign Out</span>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
