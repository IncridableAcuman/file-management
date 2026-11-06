import React, { useState } from 'react';
import { 
  User, 
  Key, 
  HardDrive, 
  RotateCcw, 
  Check, 
  Sparkles,
  ShieldAlert,
  Save
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { fileService } from '@/services/fileService';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
  onResetData,
}) => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ username, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMsg('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match');
      return;
    }
    setPasswordMsg('Password successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordMsg(''), 3000);
  };

  const handleResetStorage = () => {
    if (confirm('Are you sure you want to reset all mock files and folders to default?')) {
      fileService.resetToDefault();
      onResetData();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6 rounded-3xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-lg font-bold text-foreground">
            Account & System Settings
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Manage your personal profile, security credentials and storage tier.
          </p>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-muted/60 p-1 mb-4">
            <TabsTrigger value="profile" className="text-xs rounded-xl gap-1.5">
              <User className="size-3.5" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs rounded-xl gap-1.5">
              <Key className="size-3.5" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="text-xs rounded-xl gap-1.5">
              <HardDrive className="size-3.5" />
              <span>Storage Plans</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Display Name
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {isSaved && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                    <Check className="size-3.5" /> Profile updated!
                  </span>
                )}
                <div className="ml-auto">
                  <Button
                    type="submit"
                    className="h-9 px-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                  >
                    <Save className="size-3.5" />
                    <span>Save Changes</span>
                  </Button>
                </div>
              </div>
            </form>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-foreground">Reset Demo Data</h5>
                  <p className="text-[11px] text-muted-foreground">
                    Restore files and folders to default sample dataset.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetStorage}
                  className="rounded-xl text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset Data</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Current Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  New Password (min 8 chars)
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-xl text-xs"
                />
              </div>

              {passwordMsg && (
                <p className={`text-xs font-medium ${passwordMsg.includes('success') ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {passwordMsg}
                </p>
              )}

              <div className="pt-2 text-right">
                <Button
                  type="submit"
                  disabled={!newPassword || !confirmPassword}
                  className="h-9 px-4 rounded-xl text-xs bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Password
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Storage Plans Tab */}
          <TabsContent value="plans" className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-500/[0.04] space-y-3 relative">
                <Badge className="bg-blue-600 text-white text-[10px]">Current Plan</Badge>
                <h4 className="font-bold text-base text-foreground">Pro Plan (100 GB)</h4>
                <p className="text-xs text-muted-foreground">
                  Unlimited folders, file versioning, 2FA security and team sharing.
                </p>
                <div className="text-xl font-bold text-foreground">
                  $9.99 <span className="text-xs font-normal text-muted-foreground">/ month</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                <Badge variant="outline" className="text-[10px]">Upgrade</Badge>
                <h4 className="font-bold text-base text-foreground">Enterprise (1 TB)</h4>
                <p className="text-xs text-muted-foreground">
                  Dedicated cloud infrastructure, custom domain, SSO, priority SLA.
                </p>
                <div className="text-xl font-bold text-foreground">
                  $29.99 <span className="text-xs font-normal text-muted-foreground">/ month</span>
                </div>
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1.5">
                  <Sparkles className="size-3 text-amber-500" />
                  <span>Contact Sales</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
