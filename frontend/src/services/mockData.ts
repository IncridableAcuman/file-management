import type { FileItem, FolderItem } from '@/types/file';

export const INITIAL_FOLDERS: FolderItem[] = [
  {
    id: 'folder-1',
    name: 'Work Projects 2026',
    parentId: null,
    color: '#3b82f6', // blue
    isFavorite: true,
    fileCount: 14,
    totalSize: 1024 * 1024 * 340, // 340 MB
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' }
  },
  {
    id: 'folder-2',
    name: 'Design System & UI Kits',
    parentId: null,
    color: '#8b5cf6', // purple
    isFavorite: true,
    fileCount: 8,
    totalSize: 1024 * 1024 * 512, // 512 MB
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' }
  },
  {
    id: 'folder-3',
    name: 'Financial Reports & Invoices',
    parentId: null,
    color: '#10b981', // green
    isFavorite: false,
    fileCount: 22,
    totalSize: 1024 * 1024 * 85, // 85 MB
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' }
  },
  {
    id: 'folder-4',
    name: 'Personal Documents',
    parentId: null,
    color: '#f59e0b', // amber
    isFavorite: false,
    fileCount: 5,
    totalSize: 1024 * 1024 * 24, // 24 MB
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' }
  },
  {
    id: 'folder-5',
    name: 'Backend API Specs',
    parentId: 'folder-1',
    color: '#06b6d4', // cyan
    isFavorite: false,
    fileCount: 6,
    totalSize: 1024 * 1024 * 42, // 42 MB
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' }
  }
];

export const INITIAL_FILES: FileItem[] = [
  {
    id: 'file-1',
    name: 'Product_Architecture_v2.pdf',
    extension: 'pdf',
    category: 'documents',
    mimeType: 'application/pdf',
    size: 1024 * 1024 * 4.8, // 4.8 MB
    folderId: 'folder-1',
    isFavorite: true,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    sharedWith: [
      { email: 'alex.team@company.io', role: 'editor', addedAt: new Date().toISOString() },
      { email: 'sarah.lead@company.io', role: 'viewer', addedAt: new Date().toISOString() }
    ],
    description: 'System microservices architecture specification and schema documentation for 2026 Q4 release.',
    tags: ['Architecture', 'Specs', 'Important']
  },
  {
    id: 'file-2',
    name: 'Dashboard_UI_Mockup_Final.png',
    extension: 'png',
    category: 'images',
    mimeType: 'image/png',
    size: 1024 * 1024 * 8.2, // 8.2 MB
    folderId: 'folder-2',
    isFavorite: true,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    description: 'High-fidelity UI dashboard designs and color tokens export.',
    tags: ['UI', 'Shadcn', 'Figma']
  },
  {
    id: 'file-3',
    name: 'Quarterly_Revenue_Q3_2026.xlsx',
    extension: 'xlsx',
    category: 'documents',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024 * 1024 * 2.1, // 2.1 MB
    folderId: 'folder-3',
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    description: 'Audited financial balance sheet, revenue breakdown and growth KPIs.',
    tags: ['Finance', 'Reports']
  },
  {
    id: 'file-4',
    name: 'Brand_Promo_Teaser_4k.mp4',
    extension: 'mp4',
    category: 'videos',
    mimeType: 'video/mp4',
    size: 1024 * 1024 * 85.5, // 85.5 MB
    folderId: null,
    isFavorite: true,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80',
    description: 'Product presentation promotional video for website hero section.',
    tags: ['Media', 'Marketing']
  },
  {
    id: 'file-5',
    name: 'application-production-configs.json',
    extension: 'json',
    category: 'code',
    mimeType: 'application/json',
    size: 1024 * 64, // 64 KB
    folderId: 'folder-5',
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    description: 'Kubernetes configuration variables and Redis cluster settings.',
    tags: ['DevOps', 'Config']
  },
  {
    id: 'file-6',
    name: 'Assets_Icons_Backup.zip',
    extension: 'zip',
    category: 'archives',
    mimeType: 'application/zip',
    size: 1024 * 1024 * 142.3, // 142.3 MB
    folderId: 'folder-2',
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    description: 'Complete SVG and vector icon pack export.',
    tags: ['Assets', 'Archive']
  },
  {
    id: 'file-7',
    name: 'Podcast_Interview_Episode_12.mp3',
    extension: 'mp3',
    category: 'audio',
    mimeType: 'audio/mpeg',
    size: 1024 * 1024 * 38.6, // 38.6 MB
    folderId: null,
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    description: 'Tech talk audio record on Cloud Native systems.',
    tags: ['Audio', 'Podcast']
  },
  {
    id: 'file-8',
    name: 'Modern_Workspace_Setup.jpg',
    extension: 'jpg',
    category: 'images',
    mimeType: 'image/jpeg',
    size: 1024 * 1024 * 5.4, // 5.4 MB
    folderId: null,
    isFavorite: false,
    isTrashed: false,
    createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    owner: { id: 2, name: 'Malika Karimova', email: 'malika@team.uz' },
    sharedWith: [
      { email: 'abdusharipovizzat03@gmail.com', role: 'viewer', addedAt: new Date().toISOString() }
    ],
    thumbnailUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    description: 'Shared office team photo for team page.',
    tags: ['Team', 'Photo']
  },
  {
    id: 'file-9',
    name: 'Draft_Outdated_Proposal.docx',
    extension: 'docx',
    category: 'documents',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024 * 850, // 850 KB
    folderId: null,
    isFavorite: false,
    isTrashed: true,
    trashedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    owner: { id: 1, name: 'Izzatbek', email: 'abdusharipovizzat03@gmail.com' },
    description: 'Old proposal draft, archived.',
    tags: ['Trash', 'Old']
  }
];
