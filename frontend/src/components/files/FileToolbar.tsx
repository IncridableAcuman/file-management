import React from 'react';
import { 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  CheckSquare, 
  Trash2, 
  Download, 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Archive, 
  FileCode, 
  Folder
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FileCategory, SortField, SortOrder, ViewMode } from '@/types/file';

interface FileToolbarProps {
  currentCategory: FileCategory;
  onSelectCategory: (category: FileCategory) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortField: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  selectedCount: number;
  totalCount: number;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onBulkDelete?: () => void;
  onBulkDownload?: () => void;
}

export const FileToolbar: React.FC<FileToolbarProps> = ({
  currentCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
  sortField,
  sortOrder,
  onSortChange,
  selectedCount,
  totalCount,
  onDeselectAll,
  onBulkDelete,
  onBulkDownload,
}) => {
  const categories: Array<{ id: FileCategory; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'all', label: 'All Files', icon: Folder },
    { id: 'documents', label: 'Docs', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'archives', label: 'Archives', icon: Archive },
    { id: 'code', label: 'Code', icon: FileCode },
  ];

  const sortOptions: Array<{ field: SortField; label: string }> = [
    { field: 'updatedAt', label: 'Last Modified' },
    { field: 'name', label: 'Name (A-Z)' },
    { field: 'size', label: 'File Size' },
    { field: 'type', label: 'Type' },
  ];

  const currentSortLabel = sortOptions.find((s) => s.field === sortField)?.label || 'Sort';

  return (
    <div className="space-y-4">
      {/* Category Tabs (Scrollable on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex shrink-0 items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'bg-foreground text-background shadow-sm font-semibold scale-[1.02]'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Action Bar / Selection Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
        {/* Left: Total files or Bulk selection actions */}
        <div className="flex items-center gap-3">
          {selectedCount > 0 ? (
            <div className="flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl text-xs font-semibold animate-in fade-in">
              <CheckSquare className="size-3.5" />
              <span>{selectedCount} selected</span>
              <button
                onClick={onDeselectAll}
                className="ml-1 text-muted-foreground hover:text-foreground text-[11px] underline"
              >
                Clear
              </button>
            </div>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">
              {totalCount} items total
            </span>
          )}

          {selectedCount > 0 && (
            <div className="flex items-center gap-1.5">
              {onBulkDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBulkDownload}
                  className="h-7 text-xs gap-1.5 rounded-lg"
                >
                  <Download className="size-3.5" />
                  <span>Download</span>
                </Button>
              )}
              {onBulkDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onBulkDelete}
                  className="h-7 text-xs gap-1.5 rounded-lg"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete</span>
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right: Sort & View Mode */}
        <div className="flex items-center gap-2">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 rounded-xl border-border/70 hover:bg-muted/70 text-muted-foreground hover:text-foreground"
              >
                <ArrowUpDown className="size-3.5" />
                <span className="hidden sm:inline">Sort:</span>
                <span className="font-semibold text-foreground">{currentSortLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1 rounded-xl">
              {sortOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.field}
                  onClick={() => {
                    if (sortField === opt.field) {
                      onSortChange(opt.field, sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      onSortChange(opt.field, 'asc');
                    }
                  }}
                  className="flex items-center justify-between text-xs px-2.5 py-2 cursor-pointer rounded-lg"
                >
                  <span className={sortField === opt.field ? 'font-semibold text-primary' : ''}>
                    {opt.label}
                  </span>
                  {sortField === opt.field && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {sortOrder.toUpperCase()}
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Mode Toggle: Grid or List */}
          <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border/60">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'grid'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-background text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="List View"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
