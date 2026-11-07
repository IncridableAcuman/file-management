package com.hotel.backend.service;

import com.hotel.backend.dto.AdminStatsDto;
import com.hotel.backend.dto.AdminUserDto;
import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FileRepository fileRepository;
    private final FolderRepository folderRepository;
    private final NotificationRepository notificationRepository;
    private final TokenRepository tokenRepository;

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByEnabled(true);
        long disabledUsers = userRepository.countByEnabled(false);
        long adminUsers = userRepository.countByRole_Type(RoleType.ADMIN);
        long regularUsers = userRepository.countByRole_Type(RoleType.USER);

        long totalFiles = fileRepository.countByIsTrashedFalse();
        long trashedFiles = fileRepository.countByIsTrashedTrue();
        long totalFolders = folderRepository.countByIsTrashedFalse();
        Long storageUsedRaw = fileRepository.sumTotalSize();
        long totalStorageUsed = storageUsedRaw != null ? storageUsedRaw : 0L;
        double avgFileSize = totalFiles > 0 ? (double) totalStorageUsed / totalFiles : 0.0;

        // Category stats
        List<Object[]> rawCategoryStats = fileRepository.getStatsByCategory();
        List<AdminStatsDto.CategoryStat> categoryStats = new ArrayList<>();
        Map<String, AdminStatsDto.CategoryStat> catMap = new HashMap<>();

        // Standard categories to ensure complete representation
        String[] standardCats = {"documents", "images", "videos", "audio", "archives", "code", "other"};
        for (String cat : standardCats) {
            catMap.put(cat, new AdminStatsDto.CategoryStat(cat, 0L, 0L));
        }

        if (rawCategoryStats != null) {
            for (Object[] row : rawCategoryStats) {
                if (row.length >= 3 && row[0] != null) {
                    String catName = row[0].toString().toLowerCase();
                    long count = ((Number) row[1]).longValue();
                    long size = ((Number) row[2]).longValue();
                    catMap.put(catName, new AdminStatsDto.CategoryStat(catName, count, size));
                }
            }
        }
        categoryStats.addAll(catMap.values());

        // Top users by storage
        List<UserEntity> allUsers = userRepository.findAll();
        List<AdminStatsDto.UserStorageStat> topUsers = new ArrayList<>();

        for (UserEntity u : allUsers) {
            long userFilesCount = fileRepository.countByOwnerAndIsTrashedFalse(u);
            Long userStorage = fileRepository.sumSizeByOwnerAndIsTrashedFalse(u);
            long bytes = userStorage != null ? userStorage : 0L;
            String roleName = u.getRole() != null && u.getRole().getType() != null
                    ? u.getRole().getType().name()
                    : "USER";

            topUsers.add(AdminStatsDto.UserStorageStat.builder()
                    .userId(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .role(roleName)
                    .filesCount(userFilesCount)
                    .storageUsed(bytes)
                    .build());
        }

        topUsers.sort((a, b) -> Long.compare(b.getStorageUsed(), a.getStorageUsed()));
        if (topUsers.size() > 10) {
            topUsers = topUsers.subList(0, 10);
        }

        return AdminStatsDto.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .disabledUsers(disabledUsers)
                .adminUsers(adminUsers)
                .regularUsers(regularUsers)
                .totalFiles(totalFiles)
                .trashedFiles(trashedFiles)
                .totalFolders(totalFolders)
                .totalStorageUsed(totalStorageUsed)
                .averageFileSize(avgFileSize)
                .categoryStats(categoryStats)
                .topStorageUsers(topUsers)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminUserDto> getAllUsersWithStats() {
        List<UserEntity> users = userRepository.findAll();
        List<AdminUserDto> dtos = new ArrayList<>();

        for (UserEntity u : users) {
            long filesCount = fileRepository.countByOwnerAndIsTrashedFalse(u);
            long foldersCount = folderRepository.countByOwnerAndIsTrashedFalse(u);
            Long userStorage = fileRepository.sumSizeByOwnerAndIsTrashedFalse(u);
            long storageUsed = userStorage != null ? userStorage : 0L;

            dtos.add(AdminUserDto.from(u, filesCount, foldersCount, storageUsed));
        }

        // Sort by id ascending or created descending
        dtos.sort(Comparator.comparing(AdminUserDto::getId));
        return dtos;
    }

    @Transactional
    public AdminUserDto setUserStatus(Long userId, boolean enabled) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomNotFoundException("User not found with id: " + userId));

        user.setEnabled(enabled);
        UserEntity updated = userRepository.save(user);

        long filesCount = fileRepository.countByOwnerAndIsTrashedFalse(updated);
        long foldersCount = folderRepository.countByOwnerAndIsTrashedFalse(updated);
        Long userStorage = fileRepository.sumSizeByOwnerAndIsTrashedFalse(updated);

        return AdminUserDto.from(updated, filesCount, foldersCount, userStorage != null ? userStorage : 0L);
    }

    @Transactional
    public AdminUserDto changeUserRole(Long userId, RoleType newRole) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomNotFoundException("User not found with id: " + userId));

        RoleEntity role = user.getRole();
        if (role == null) {
            role = RoleEntity.builder()
                    .user(user)
                    .type(newRole)
                    .build();
            user.setRole(role);
        } else {
            role.setType(newRole);
        }
        roleRepository.save(role);
        UserEntity updated = userRepository.save(user);

        long filesCount = fileRepository.countByOwnerAndIsTrashedFalse(updated);
        long foldersCount = folderRepository.countByOwnerAndIsTrashedFalse(updated);
        Long userStorage = fileRepository.sumSizeByOwnerAndIsTrashedFalse(updated);

        return AdminUserDto.from(updated, filesCount, foldersCount, userStorage != null ? userStorage : 0L);
    }

    @Transactional
    public void deleteUser(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomNotFoundException("User not found with id: " + userId));

        // Delete notifications
        notificationRepository.deleteAllByRecipient(user);

        // Delete tokens
        tokenRepository.deleteByUser(user);

        // Delete files
        fileRepository.deleteAllByOwner(user);

        // Delete folders
        folderRepository.deleteAllByOwner(user);

        // Delete user
        userRepository.delete(user);
    }
}
