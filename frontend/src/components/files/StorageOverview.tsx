import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Archive, 
  FileCode, 
  HardDrive
} from 'lucide-react';
import { formatBytes } from '@/lib/fileUtils';
import type { FileCategory, StorageStats } from '@/types/file';

interface StorageOverviewProps {
  stats: StorageStats;
  onSelectCategory?: (category: FileCategory) => void;
}

export const StorageOverview: React.FC<StorageOverviewProps> = ({
  stats,
  onSelectCategory,
}) => {
  const percentUsed = Math.min(
    100,
    Math.round((stats.used / (stats.total || 1)) * 100)
  );

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'documents': return FileText;
      case 'images': return ImageIcon;
      case 'videos': return Film;
      case 'audio': return Music;
      case 'archives': return Archive;
      case 'code': return FileCode;
      default: return HardDrive;
    }
  };

  return (
    <div className="space-y-4">
      {/* Big Storage Bar Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-blue-500/[0.03] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cloud Storage
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Healthy
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {formatBytes(stats.used)}{' '}
              <span className="text-base font-normal text-muted-foreground">
                of {formatBytes(stats.total)} used
              </span>
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right sm:block hidden">
              <span className="text-xs text-muted-foreground block">Available Free</span>
              <span className="text-sm font-semibold text-foreground">
                {formatBytes(Math.max(0, stats.total - stats.used))}
              </span>
            </div>
            <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25">
              {percentUsed}%
            </div>
          </div>
        </div>

        {/* Multi-segment stacked progress bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/80 flex gap-0.5 p-0.5">
          {stats.categories.map((cat) => {
            const widthPct = stats.used > 0 ? (cat.size / stats.total) * 100 : 0;
            if (widthPct <= 0.2) return null;
            return (
              <div
                key={cat.category}
                className={`h-full rounded-full transition-all duration-500 ${cat.accentBg}`}
                style={{ width: `${widthPct}%` }}
                title={`${cat.label}: ${formatBytes(cat.size)}`}
              />
            );
          })}
        </div>

        {/* Categories Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
          {stats.categories.map((cat) => {
            const Icon = getCategoryIcon(cat.category);
            return (
              <div
                key={cat.category}
                onClick={() => onSelectCategory && onSelectCategory(cat.category)}
                className="group relative flex flex-col justify-between p-3.5 rounded-2xl border border-border/60 bg-background/50 hover:bg-muted/50 hover:border-border transition-all cursor-pointer select-none"
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="p-2 rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                    {cat.fileCount}
                  </span>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-foreground truncate">
                    {cat.label}
                  </h5>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                    {formatBytes(cat.size)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
