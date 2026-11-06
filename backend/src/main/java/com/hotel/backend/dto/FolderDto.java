package com.hotel.backend.dto;

import com.hotel.backend.entity.FolderEntity;
import com.hotel.backend.entity.UserEntity;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.format.DateTimeFormatter;

public class FolderDto {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Data
    public static class FolderCreateRequest {
        @NotBlank(message = "Folder name is required")
        private String name;
        private Long parentId;
        private String color;
    }

    @Data
    public static class FolderRenameRequest {
        @NotBlank(message = "Folder name is required")
        private String name;
    }

    public record FolderOwnerResponse(
            Long id,
            String name,
            String email
    ) {
        public static FolderOwnerResponse from(UserEntity user) {
            if (user == null) return null;
            return new FolderOwnerResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail()
            );
        }
    }

    public record FolderResponse(
            String id,
            String name,
            String parentId,
            String color,
            Boolean isFavorite,
            Boolean isTrashed,
            String trashedAt,
            long fileCount,
            long totalSize,
            String createdAt,
            String updatedAt,
            FolderOwnerResponse owner
    ) {
        public static FolderResponse of(FolderEntity folder, long fileCount, long totalSize) {
            return new FolderResponse(
                    String.valueOf(folder.getId()),
                    folder.getName(),
                    folder.getParentId() != null ? String.valueOf(folder.getParentId()) : null,
                    folder.getColor() != null ? folder.getColor() : "#3b82f6",
                    Boolean.TRUE.equals(folder.getIsFavorite()),
                    Boolean.TRUE.equals(folder.getIsTrashed()),
                    folder.getTrashedAt() != null ? folder.getTrashedAt().format(ISO_FORMATTER) : null,
                    fileCount,
                    totalSize,
                    folder.getCreatedAt() != null ? folder.getCreatedAt().format(ISO_FORMATTER) : null,
                    folder.getUpdatedAt() != null ? folder.getUpdatedAt().format(ISO_FORMATTER) : null,
                    FolderOwnerResponse.from(folder.getOwner())
            );
        }
    }
}
