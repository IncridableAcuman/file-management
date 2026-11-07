package com.hotel.backend.dto;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDto {
    private Long id;
    private String username;
    private String email;
    private String role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private long totalFiles;
    private long totalFolders;
    private long totalStorageUsed;

    public static AdminUserDto from(UserEntity user, long totalFiles, long totalFolders, long totalStorageUsed) {
        String roleName = user.getRole() != null && user.getRole().getType() != null
                ? user.getRole().getType().name()
                : "USER";

        return AdminUserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(roleName)
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .totalFiles(totalFiles)
                .totalFolders(totalFolders)
                .totalStorageUsed(totalStorageUsed)
                .build();
    }
}
