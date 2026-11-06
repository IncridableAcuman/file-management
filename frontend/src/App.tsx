import React, { useState, useMemo } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, type NavTab } from '@/components/layout/Sidebar';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyFilesPage } from '@/pages/MyFilesPage';
import { SharedPage } from '@/pages/SharedPage';
import { StarredPage } from '@/pages/StarredPage';
import { RecentPage } from '@/pages/RecentPage';
import { TrashPage } from '@/pages/TrashPage';
import { AuthPage } from '@/pages/AuthPage';

// Modals
import { FileUploadModal } from '@/components/files/FileUploadModal';
import { NewFolderModal } from '@/components/files/NewFolderModal';
import { FilePreviewModal } from '@/components/files/FilePreviewModal';
import { FileShareModal } from '@/components/files/FileShareModal';
import { FileRenameModal } from '@/components/files/FileRenameModal';
import { FileDetailsDrawer } from '@/components/files/FileDetailsDrawer';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { LogoutConfirmDialog } from '@/components/auth/LogoutConfirmDialog';

import { fileService } from '@/services/fileService';
import type { 
  FileCategory, 
  FileItem, 
  FolderItem, 
  SortField, 
  SortOrder, 
  ViewMode 
} from '@/types/file';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  // State: Navigation & Views
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<FileCategory>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // State: Data Store
  const [files, setFiles] = useState<FileItem[]>(() => fileService.getFiles());
  const [folders, setFolders] = useState<FolderItem[]>(() => fileService.getFolders());
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  // State: Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [detailsFile, setDetailsFile] = useState<FileItem | null>(null);
  const [renameItem, setRenameItem] = useState<{ item: FileItem | FolderItem; isFolder: boolean } | null>(null);

  // Refresh data from fileService
  const refreshData = () => {
    setFiles([...fileService.getFiles()]);
    setFolders([...fileService.getFolders()]);
  };

  const storageStats = useMemo(() => fileService.getStorageStats(), [files]);

  // Filter & Sort files
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Category filter
      if (currentCategory !== 'all' && file.category !== currentCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = file.name.toLowerCase().includes(q);
        const matchesTags = file.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesExt = file.extension?.toLowerCase().includes(q);
        if (!matchesName && !matchesTags && !matchesExt) return false;
      }
      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortField === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (sortField === 'size') {
        comp = a.size - b.size;
      } else if (sortField === 'type') {
        comp = (a.extension || '').localeCompare(b.extension || '');
      } else {
        comp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [files, currentCategory, searchQuery, sortField, sortOrder]);

  // Handlers: Selection
  const handleSelectFile = (fileId: string, selected: boolean) => {
    if (selected) {
      setSelectedFileIds((prev) => [...prev, fileId]);
    } else {
      setSelectedFileIds((prev) => prev.filter((id) => id !== fileId));
    }
  };

  const handleDeselectAll = () => {
    setSelectedFileIds([]);
  };

  const handleBulkDelete = () => {
    selectedFileIds.forEach((id) => fileService.moveToTrash(id, false));
    setSelectedFileIds([]);
    refreshData();
  };

  const handleBulkDownload = () => {
    const toDownload = files.filter((f) => selectedFileIds.includes(f.id));
    toDownload.forEach((f) => {
      const blob = new Blob([`Content of ${f.name}`], { type: f.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = f.name;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Handlers: File operations
  const handleUploadFiles = (
    uploaded: Array<{ name: string; size: number; mimeType: string; previewUrl?: string }>,
    folderId: string | null
  ) => {
    uploaded.forEach((f) => {
      fileService.uploadFile(f, folderId, f.previewUrl);
    });
    refreshData();
  };

  const handleCreateFolder = (name: string, color: string) => {
    fileService.createFolder(name, currentFolderId, color);
    refreshData();
  };

  const handleRename = (id: string, newName: string, isFolder: boolean) => {
    fileService.renameItem(id, newName, isFolder);
    refreshData();
  };

  const handleDeleteFile = (fileId: string) => {
    fileService.moveToTrash(fileId, false);
    refreshData();
  };

  const handleDeleteFolder = (folderId: string) => {
    fileService.moveToTrash(folderId, true);
    refreshData();
  };

  const handleToggleFavoriteFile = (fileId: string) => {
    fileService.toggleFavorite(fileId, false);
    refreshData();
  };

  const handleToggleFavoriteFolder = (folderId: string) => {
    fileService.toggleFavorite(folderId, true);
    refreshData();
  };

  const handleShareFile = (fileId: string, email: string, role: 'viewer' | 'editor') => {
    fileService.shareFile(fileId, email, role);
    refreshData();
  };

  // Trash operations
  const handleRestoreFile = (fileId: string) => {
    fileService.restoreFromTrash(fileId, false);
    refreshData();
  };

  const handleRestoreFolder = (folderId: string) => {
    fileService.restoreFromTrash(folderId, true);
    refreshData();
  };

  const handleDeleteFilePermanently = (fileId: string) => {
    fileService.deletePermanently(fileId, false);
    refreshData();
  };

  const handleDeleteFolderPermanently = (folderId: string) => {
    fileService.deletePermanently(folderId, true);
    refreshData();
  };

  const handleEmptyTrash = () => {
    fileService.emptyTrash();
    refreshData();
  };

  const hasResetToken = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('token');

  if (!isAuthenticated || hasResetToken) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-blue-500/20 selection:text-blue-600">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setCurrentFolderId(null);
          setCurrentCategory('all');
        }}
        storageStats={storageStats}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 md:pl-64 lg:pl-72 flex flex-col min-w-0">
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenNewFolder={() => setIsNewFolderOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          onRequestLogout={() => setIsLogoutConfirmOpen(true)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              storageStats={storageStats}
              folders={folders}
              files={filteredFiles}
              selectedFileIds={selectedFileIds}
              onSelectFile={handleSelectFile}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
              onOpenFolder={(id) => {
                setCurrentFolderId(id);
                setCurrentTab('my-files');
              }}
              onRenameFolder={(folder) => setRenameItem({ item: folder, isFolder: true })}
              onDeleteFolder={handleDeleteFolder}
              onToggleFavoriteFolder={handleToggleFavoriteFolder}
              onPreviewFile={(file) => setPreviewFile(file)}
              onDetailsFile={(file) => setDetailsFile(file)}
              onRenameFile={(file) => setRenameItem({ item: file, isFolder: false })}
              onShareFile={(file) => setShareFile(file)}
              onDeleteFile={handleDeleteFile}
              onToggleFavoriteFile={handleToggleFavoriteFile}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewFolder={() => setIsNewFolderOpen(true)}
            />
          )}

          {currentTab === 'my-files' && (
            <MyFilesPage
              currentFolderId={currentFolderId}
              onNavigateFolder={setCurrentFolderId}
              folders={folders}
              files={filteredFiles}
              selectedFileIds={selectedFileIds}
              onSelectFile={handleSelectFile}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
              onRenameFolder={(folder) => setRenameItem({ item: folder, isFolder: true })}
              onDeleteFolder={handleDeleteFolder}
              onToggleFavoriteFolder={handleToggleFavoriteFolder}
              onPreviewFile={(file) => setPreviewFile(file)}
              onDetailsFile={(file) => setDetailsFile(file)}
              onRenameFile={(file) => setRenameItem({ item: file, isFolder: false })}
              onShareFile={(file) => setShareFile(file)}
              onDeleteFile={handleDeleteFile}
              onToggleFavoriteFile={handleToggleFavoriteFile}
              onOpenUpload={() => setIsUploadOpen(true)}
              onOpenNewFolder={() => setIsNewFolderOpen(true)}
            />
          )}

          {currentTab === 'shared' && (
            <SharedPage
              files={filteredFiles}
              selectedFileIds={selectedFileIds}
              onSelectFile={handleSelectFile}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
              onPreviewFile={(file) => setPreviewFile(file)}
              onDetailsFile={(file) => setDetailsFile(file)}
              onRenameFile={(file) => setRenameItem({ item: file, isFolder: false })}
              onShareFile={(file) => setShareFile(file)}
              onDeleteFile={handleDeleteFile}
              onToggleFavoriteFile={handleToggleFavoriteFile}
            />
          )}

          {currentTab === 'starred' && (
            <StarredPage
              folders={folders}
              files={filteredFiles}
              selectedFileIds={selectedFileIds}
              onSelectFile={handleSelectFile}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
              onOpenFolder={(id) => {
                setCurrentFolderId(id);
                setCurrentTab('my-files');
              }}
              onRenameFolder={(folder) => setRenameItem({ item: folder, isFolder: true })}
              onDeleteFolder={handleDeleteFolder}
              onToggleFavoriteFolder={handleToggleFavoriteFolder}
              onPreviewFile={(file) => setPreviewFile(file)}
              onDetailsFile={(file) => setDetailsFile(file)}
              onRenameFile={(file) => setRenameItem({ item: file, isFolder: false })}
              onShareFile={(file) => setShareFile(file)}
              onDeleteFile={handleDeleteFile}
              onToggleFavoriteFile={handleToggleFavoriteFile}
            />
          )}

          {currentTab === 'recent' && (
            <RecentPage
              files={filteredFiles}
              selectedFileIds={selectedFileIds}
              onSelectFile={handleSelectFile}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onBulkDownload={handleBulkDownload}
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={(field, order) => {
                setSortField(field);
                setSortOrder(order);
              }}
              onPreviewFile={(file) => setPreviewFile(file)}
              onDetailsFile={(file) => setDetailsFile(file)}
              onRenameFile={(file) => setRenameItem({ item: file, isFolder: false })}
              onShareFile={(file) => setShareFile(file)}
              onDeleteFile={handleDeleteFile}
              onToggleFavoriteFile={handleToggleFavoriteFile}
            />
          )}

          {currentTab === 'trash' && (
            <TrashPage
              folders={folders}
              files={files}
              viewMode={viewMode}
              onEmptyTrash={handleEmptyTrash}
              onRestoreFolder={handleRestoreFolder}
              onDeleteFolderPermanently={handleDeleteFolderPermanently}
              onRestoreFile={handleRestoreFile}
              onDeleteFilePermanently={handleDeleteFilePermanently}
              onPreviewFile={(file) => setPreviewFile(file)}
              onDetailsFile={(file) => setDetailsFile(file)}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <FileUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        folders={folders}
        currentFolderId={currentFolderId}
        onUpload={handleUploadFiles}
      />

      <NewFolderModal
        open={isNewFolderOpen}
        onOpenChange={setIsNewFolderOpen}
        onCreateFolder={handleCreateFolder}
      />

      <FilePreviewModal
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        onShare={(file) => {
          setPreviewFile(null);
          setShareFile(file);
        }}
        onToggleFavorite={handleToggleFavoriteFile}
      />

      <FileShareModal
        file={shareFile}
        open={!!shareFile}
        onOpenChange={(open) => !open && setShareFile(null)}
        onShare={handleShareFile}
      />

      <FileRenameModal
        item={renameItem?.item || null}
        isFolder={!!renameItem?.isFolder}
        open={!!renameItem}
        onOpenChange={(open) => !open && setRenameItem(null)}
        onRename={handleRename}
      />

      <FileDetailsDrawer
        file={detailsFile}
        folders={folders}
        open={!!detailsFile}
        onOpenChange={(open) => !open && setDetailsFile(null)}
        onShare={(file) => {
          setDetailsFile(null);
          setShareFile(file);
        }}
      />

      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onResetData={refreshData}
      />

      <LogoutConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        onConfirmLogout={logout}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
