package com.hotel.backend.service;

import com.hotel.backend.dto.FolderDto;
import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.FolderEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.FileRepository;
import com.hotel.backend.repository.FolderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FolderService {

    private final FolderRepository folderRepository;
    private final FileRepository fileRepository;
    private final FileStorageService fileStorageService;

    @Transactional(readOnly = true)
    public List<FolderDto.FolderResponse> getFolders(UserEntity user, Boolean trashed, Boolean favorite) {
        List<FolderEntity> folders;

        if (Boolean.TRUE.equals(favorite)) {
            folders = folderRepository.findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(user);
        } else if (Boolean.TRUE.equals(trashed)) {
            folders = folderRepository.findAllByOwnerAndIsTrashed(user, true);
        } else {
            folders = folderRepository.findAllByOwnerAndIsTrashed(user, false);
        }

        return folders.stream().map(folder -> {
            long count = fileRepository.countByFolderIdAndIsTrashedFalse(folder.getId());
            Long size = fileRepository.sumSizeByFolderIdAndIsTrashedFalse(folder.getId());
            return FolderDto.FolderResponse.of(folder, count, size != null ? size : 0L);
        }).toList();
    }

    @Transactional(readOnly = true)
    public FolderDto.FolderResponse getFolderById(Long id, UserEntity user) {
        FolderEntity folder = folderRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + id));
        long count = fileRepository.countByFolderIdAndIsTrashedFalse(folder.getId());
        Long size = fileRepository.sumSizeByFolderIdAndIsTrashedFalse(folder.getId());
        return FolderDto.FolderResponse.of(folder, count, size != null ? size : 0L);
    }

    @Transactional
    public FolderDto.FolderResponse createFolder(FolderDto.FolderCreateRequest request, UserEntity user) {
        if (request.getParentId() != null) {
            folderRepository.findByIdAndOwner(request.getParentId(), user)
                    .orElseThrow(() -> new CustomNotFoundException("Parent folder not found"));
        }

        FolderEntity folder = FolderEntity.builder()
                .name(request.getName().trim())
                .parentId(request.getParentId())
                .color(request.getColor() != null && !request.getColor().isBlank() ? request.getColor() : "#3b82f6")
                .owner(user)
                .isFavorite(false)
                .isTrashed(false)
                .build();

        FolderEntity saved = folderRepository.save(folder);
        return FolderDto.FolderResponse.of(saved, 0, 0);
    }

    @Transactional
    public FolderDto.FolderResponse renameFolder(Long id, String newName, UserEntity user) {
        FolderEntity folder = folderRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + id));

        folder.setName(newName.trim());
        FolderEntity saved = folderRepository.save(folder);
        long count = fileRepository.countByFolderIdAndIsTrashedFalse(saved.getId());
        Long size = fileRepository.sumSizeByFolderIdAndIsTrashedFalse(saved.getId());
        return FolderDto.FolderResponse.of(saved, count, size != null ? size : 0L);
    }

    @Transactional
    public FolderDto.FolderResponse toggleFavorite(Long id, UserEntity user) {
        FolderEntity folder = folderRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + id));

        folder.setIsFavorite(!Boolean.TRUE.equals(folder.getIsFavorite()));
        FolderEntity saved = folderRepository.save(folder);
        long count = fileRepository.countByFolderIdAndIsTrashedFalse(saved.getId());
        Long size = fileRepository.sumSizeByFolderIdAndIsTrashedFalse(saved.getId());
        return FolderDto.FolderResponse.of(saved, count, size != null ? size : 0L);
    }

    @Transactional
    public void moveToTrash(Long id, UserEntity user) {
        FolderEntity folder = folderRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + id));

        folder.setIsTrashed(true);
        folder.setTrashedAt(LocalDateTime.now());
        folderRepository.save(folder);

        // Also move files inside this folder to trash
        List<FileEntity> files = fileRepository.findAllByFolderIdAndOwnerAndIsTrashedFalse(id, user);
        for (FileEntity f : files) {
            f.setIsTrashed(true);
            f.setTrashedAt(LocalDateTime.now());
            fileRepository.save(f);
        }
    }

    @Transactional
    public void restoreFromTrash(Long id, UserEntity user) {
        FolderEntity folder = folderRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + id));

        folder.setIsTrashed(false);
        folder.setTrashedAt(null);
        folderRepository.save(folder);

        // Restore child files
        List<FileEntity> files = fileRepository.findAllByOwnerAndIsTrashed(user, true);
        for (FileEntity f : files) {
            if (id.equals(f.getFolderId())) {
                f.setIsTrashed(false);
                f.setTrashedAt(null);
                fileRepository.save(f);
            }
        }
    }

    @Transactional
    public void deletePermanently(Long id, UserEntity user) {
        FolderEntity folder = folderRepository.findByIdAndOwner(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Folder not found with id: " + id));

        // Delete physical files belonging to this folder
        List<FileEntity> files = fileRepository.findAllByOwner(user).stream()
                .filter(f -> id.equals(f.getFolderId()))
                .toList();

        for (FileEntity file : files) {
            fileStorageService.deletePhysicalFile(file.getFilePath());
            fileRepository.delete(file);
        }

        folderRepository.delete(folder);
    }
}
