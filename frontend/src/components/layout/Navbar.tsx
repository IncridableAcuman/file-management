import React from 'react';
import { 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  Plus, 
  FolderPlus, 
  UploadCloud, 
  LogOut, 
  Settings, 
  User as UserIcon, 
  ShieldCheck, 
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenUpload: () => void;
  onOpenNewFolder: () => void;
  onOpenSettings: () => void;
  onToggleMobileSidebar: () => void;
  onRequestLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  onOpenUpload,
  onOpenNewFolder,
  onOpenSettings,
  onToggleMobileSidebar,
  onRequestLogout,
}) => {
  const { setTheme, isDark } = useTheme();
  const { user } = useAuth();

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const initials = user?.username
    ? user.username
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'US';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/60 bg-background/80 px-4 md:px-6 backdrop-blur-md transition-all">
      {/* Left: Mobile trigger & Logo (on small screens) */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </Button>

        <div className="flex items-center gap-2.5 md:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 shadow-md shadow-blue-500/20 text-white font-bold">
            <HardDrive className="size-5" />
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            FileVault
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-72 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files, folders, tags... (Ctrl + K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-4 h-9 bg-muted/40 border-muted-foreground/20 focus-visible:bg-background rounded-xl text-sm transition-all focus-visible:ring-1 focus-visible:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions, New Button, Notifications, Dark Mode, Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* New Item Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-600/20 rounded-lg font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span className="hidden sm:inline">New</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-xl">
            <DropdownMenuItem
              onClick={onOpenUpload}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm font-medium"
            >
              <UploadCloud className="size-4 text-blue-600 dark:text-blue-400" />
              <span>Upload Files</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenNewFolder}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm font-medium"
            >
              <FolderPlus className="size-4 text-indigo-600 dark:text-indigo-400" />
              <span>New Folder</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? (
            <Sun className="size-4 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="size-4 text-slate-700 transition-transform hover:-rotate-12" />
          )}
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-2 bg-blue-600 rounded-full ring-2 ring-background animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-xl">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold">Notifications</span>
              <Badge variant="secondary" className="text-xs">2 New</Badge>
            </div>
            <DropdownMenuSeparator />
            <div className="space-y-1 py-1">
              <div className="p-2.5 hover:bg-muted/50 rounded-lg text-xs space-y-1 cursor-pointer transition-colors">
                <p className="font-medium text-foreground">File uploaded successfully</p>
                <p className="text-muted-foreground">Product_Architecture_v2.pdf has been stored securely.</p>
                <span className="text-[10px] text-muted-foreground/80">10 mins ago</span>
              </div>
              <div className="p-2.5 hover:bg-muted/50 rounded-lg text-xs space-y-1 cursor-pointer transition-colors">
                <p className="font-medium text-foreground">Storage limit at 45%</p>
                <p className="text-muted-foreground">You have 54.2 GB of free space available.</p>
                <span className="text-[10px] text-muted-foreground/80">2 hours ago</span>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* User Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition-all outline-none">
              <Avatar className="size-8 ring-2 ring-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground leading-none">
                    {user?.username || 'User'}
                  </p>
                  <Badge variant="outline" className="text-[10px] py-0 px-1 border-blue-500/40 text-blue-600 dark:text-blue-400">
                    Pro
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate leading-none">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm"
            >
              <UserIcon className="size-4 text-muted-foreground" />
              <span>Profile & Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm"
            >
              <Settings className="size-4 text-muted-foreground" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenSettings}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm"
            >
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>Security & 2FA</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onRequestLogout}
              className="flex items-center gap-2.5 px-3 py-2 cursor-pointer rounded-lg text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <LogOut className="size-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
