package com.hotel.backend.service;

import com.hotel.backend.dto.FileDto;
import com.hotel.backend.dto.StorageStatsDto;
import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.FileShareEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.FileRepository;
import com.hotel.backend.repository.FileShareRepository;
import com.hotel.backend.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final FileShareRepository fileShareRepository;
    private final FileStorageService fileStorageService;

    private static final String API_BASE_URL = "/api/v1";
    private static final long TOTAL_STORAGE_BYTES = 100L * 1024L * 1024L * 1024L; // 100 GB

    public record FileResourcePayload(Resource resource, FileEntity file) {}

    @Transactional(readOnly = true)
    public List<FileDto.FileResponse> getFiles(
            UserEntity user,
            String category,
            Long folderId,
            Boolean trashed,
            Boolean favorite,
            String search
    ) {
        List<FileEntity> files;
        if (Boolean.TRUE.equals(favorite)) {
            files = fileRepository.findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(user);
        } else if (Boolean.TRUE.equals(trashed)) {
            files = fileRepository.findAllByOwnerAndIsTrashed(user, true);
        } else {
            files = fileRepository.findAllByOwnerAndIsTrashed(user, false);
        }

        return files.stream()
                .filter(f -> {
                    // Category filter
                    if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
                        if (!category.equalsIgnoreCase(f.getCategory())) return false;
                    }
                    // Folder filter (only apply if explicitly specified and not in trash/favorite view)
                    if (folderId != null && !Boolean.TRUE.equals(trashed) && !Boolean.TRUE.equals(favorite)) {
                        if (!folderId.equals(f.getFolderId())) return false;
                    }
                    // Search query
                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchName = f.getName() != null && f.getName().toLowerCase().contains(q);
                        boolean matchExt = f.getExtension() != null && f.getExtension().toLowerCase().contains(q);
                        boolean matchTags = f.getTags() != null && f.getTags().toLowerCase().contains(q);
                        return matchName || matchExt || matchTags;
                    }
                    return true;
                })
                .sorted(Comparator.comparing(FileEntity::getUpdatedAt).reversed())
                .map(f -> FileDto.FileResponse.from(f, API_BASE_URL))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FileDto.FileResponse> getSharedFiles(UserEntity user) {
        List<FileEntity> sharedFiles = fileRepository.findAllSharedWithEmail(user.getEmail());
        return sharedFiles.stream()
                .map(f -> FileDto.FileResponse.from(f, API_BASE_URL))
                .toList();
    }

    @Transactional(readOnly = true)
    public FileDto.FileResponse getFileById(Long id, UserEntity user) {
        FileEntity file = fileRepository.findById(id)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        boolean isOwner = file.getOwner().getId().equals(user.getId());
        boolean isShared = file.getSharedWith() != null && file.getSharedWith().stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(user.getEmail()));

        if (!isOwner && !isShared) {
            throw new CustomNotFoundException("File not found with id: " + id);
        }

        return FileDto.FileResponse.from(file, API_BASE_URL);
    }

    @Transactional
    public List<FileDto.FileResponse> uploadFiles(List<MultipartFile> files, Long folderId, UserEntity user) {
        if (files == null || files.isEmpty()) {
            throw new CustomBadRequestException("No files provided for upload");
        }

        if (folderId != null) {
            folderRepository.findByIdAndOwner(folderId, user)
                    .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + folderId));
        }

        List<FileDto.FileResponse> uploadedList = new ArrayList<>();

        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;

            FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file, user.getId());

            FileEntity fileEntity = FileEntity.builder()
                    .name(info.originalName())
                    .storedName(info.storedName())
                    .filePath(info.relativePath())
                    .extension(info.extension())
                    .category(info.category())
                    .mimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                    .size(info.size())
                    .folderId(folderId)
                    .owner(user)
                    .isFavorite(false)
                    .isTrashed(false)
                    .tags("Uploaded")
                    .build();

            FileEntity saved = fileRepository.save(fileEntity);
            uploadedList.add(FileDto.FileResponse.from(saved, API_BASE_URL));
        }

        return uploadedList;
    }

    @Transactional(readOnly = true)
    public FileResourcePayload getFileResource(Long id, UserEntity user) {
        FileEntity file = fileRepository.findById(id)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        boolean isOwner = file.getOwner().getId().equals(user.getId());
        boolean isShared = file.getSharedWith() != null && file.getSharedWith().stream().anyMatch(s -> s.getEmail().equalsIgnoreCase(user.getEmail()));

        if (!isOwner && !isShared) {
            throw new CustomNotFoundException("File not found with id: " + id);
        }

        Resource resource = fileStorageService.loadFileAsResource(file.getFilePath());
        return new FileResourcePayload(resource, file);
    }

    @Transactional
    public FileDto.FileResponse renameFile(Long id, String newName, UserEntity user) {
        FileEntity file = fileRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        String trimmed = newName.trim();
        String ext = file.getExtension();
        if (ext != null && !ext.isBlank() && !trimmed.toLowerCase().endsWith("." + ext.toLowerCase())) {
            trimmed = trimmed + "." + ext;
        }

        file.setName(trimmed);
        FileEntity saved = fileRepository.save(file);
        return FileDto.FileResponse.from(saved, API_BASE_URL);
    }

    @Transactional
    public FileDto.FileResponse toggleFavorite(Long id, UserEntity user) {
        FileEntity file = fileRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        file.setIsFavorite(!Boolean.TRUE.equals(file.getIsFavorite()));
        FileEntity saved = fileRepository.save(file);
        return FileDto.FileResponse.from(saved, API_BASE_URL);
    }

    @Transactional
    public void moveToTrash(Long id, UserEntity user) {
        FileEntity file = fileRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        file.setIsTrashed(true);
        file.setTrashedAt(LocalDateTime.now());
        fileRepository.save(file);
    }

    @Transactional
    public void restoreFromTrash(Long id, UserEntity user) {
        FileEntity file = fileRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        file.setIsTrashed(false);
        file.setTrashedAt(null);
        fileRepository.save(file);
    }

    @Transactional
    public void deletePermanently(Long id, UserEntity user) {
        FileEntity file = fileRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        fileStorageService.deletePhysicalFile(file.getFilePath());
        fileRepository.delete(file);
    }

    @Transactional
    public void emptyTrash(UserEntity user) {
        List<FileEntity> trashedFiles = fileRepository.findAllByOwnerAndIsTrashed(user, true);
        for (FileEntity file : trashedFiles) {
            fileStorageService.deletePhysicalFile(file.getFilePath());
            fileRepository.delete(file);
        }

        folderRepository.deleteAllByOwnerAndIsTrashedTrue(user);
    }

    @Transactional
    public FileDto.FileResponse shareFile(Long id, FileDto.FileShareRequest request, UserEntity user) {
        FileEntity file = fileRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("File not found with id: " + id));

        Optional<FileShareEntity> existing = fileShareRepository.findByFileAndEmail(file, request.getEmail().trim().toLowerCase());
        if (existing.isPresent()) {
            FileShareEntity share = existing.get();
            share.setRole(request.getRole() != null ? request.getRole() : "viewer");
            fileShareRepository.save(share);
        } else {
            FileShareEntity share = FileShareEntity.builder()
                    .file(file)
                    .email(request.getEmail().trim().toLowerCase())
                    .role(request.getRole() != null ? request.getRole() : "viewer")
                    .build();
            fileShareRepository.save(share);
            file.getSharedWith().add(share);
        }

        FileEntity saved = fileRepository.save(file);
        return FileDto.FileResponse.from(saved, API_BASE_URL);
    }

    @Transactional(readOnly = true)
    public StorageStatsDto.StorageStatsResponse getStorageStats(UserEntity user) {
        List<FileEntity> files = fileRepository.findAllByOwnerAndIsTrashed(user, false);

        Map<String, StorageStatsDto.StorageCategoryStat> categoryMap = new LinkedHashMap<>();
        categoryMap.put("documents", new StorageStatsDto.StorageCategoryStat("documents", "Documents", 0, 0, "#3b82f6", "bg-blue-500"));
        categoryMap.put("images", new StorageStatsDto.StorageCategoryStat("images", "Images", 0, 0, "#f59e0b", "bg-amber-500"));
        categoryMap.put("videos", new StorageStatsDto.StorageCategoryStat("videos", "Videos", 0, 0, "#8b5cf6", "bg-purple-500"));
        categoryMap.put("audio", new StorageStatsDto.StorageCategoryStat("audio", "Audio", 0, 0, "#f43f5e", "bg-rose-500"));
        categoryMap.put("archives", new StorageStatsDto.StorageCategoryStat("archives", "Archives", 0, 0, "#f97316", "bg-orange-500"));
        categoryMap.put("code", new StorageStatsDto.StorageCategoryStat("code", "Code & Dev", 0, 0, "#06b6d4", "bg-cyan-500"));
        categoryMap.put("other", new StorageStatsDto.StorageCategoryStat("other", "Other", 0, 0, "#64748b", "bg-slate-500"));

        long totalUsed = 0;

        for (FileEntity f : files) {
            long size = f.getSize() != null ? f.getSize() : 0L;
            totalUsed += size;
            String cat = f.getCategory() != null ? f.getCategory().toLowerCase() : "other";
            StorageStatsDto.StorageCategoryStat existing = categoryMap.get(cat);
            if (existing != null) {
                categoryMap.put(cat, new StorageStatsDto.StorageCategoryStat(
                        existing.category(),
                        existing.label(),
                        existing.size() + size,
                        existing.fileCount() + 1,
                        existing.color(),
                        existing.accentBg()
                ));
            } else {
                categoryMap.computeIfPresent("other", (k, other) -> new StorageStatsDto.StorageCategoryStat(
                        other.category(),
                        other.label(),
                        other.size() + size,
                        other.fileCount() + 1,
                        other.color(),
                        other.accentBg()
                ));
            }
        }

        return new StorageStatsDto.StorageStatsResponse(
                TOTAL_STORAGE_BYTES,
                totalUsed,
                new ArrayList<>(categoryMap.values())
        );
    }
}
