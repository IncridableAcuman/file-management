package com.hotel.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsDto {
    // User metrics
    private long totalUsers;
    private long activeUsers;
    private long disabledUsers;
    private long adminUsers;
    private long regularUsers;

    // File & Folder metrics
    private long totalFiles;
    private long trashedFiles;
    private long totalFolders;
    private long totalStorageUsed; // bytes
    private double averageFileSize; // bytes

    // Breakdown by categories
    private List<CategoryStat> categoryStats;

    // Top users by storage consumption
    private List<UserStorageStat> topStorageUsers;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryStat {
        private String category;
        private long count;
        private long totalSize;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserStorageStat {
        private Long userId;
        private String username;
        private String email;
        private String role;
        private long filesCount;
        private long storageUsed;
    }
}
