package com.hotel.backend.dto;

import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.FileShareEntity;
import com.hotel.backend.entity.UserEntity;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class FileDto {

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Data
    public static class FileRenameRequest {
        @NotBlank(message = "File name is required")
        private String name;
    }

    @Data
    public static class FileShareRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        private String email;

        private String role = "viewer"; // viewer, editor
    }

    public record FileOwnerResponse(
            Long id,
            String name,
            String email,
            String avatar
    ) {
        public static FileOwnerResponse from(UserEntity user) {
            if (user == null) return null;
            return new FileOwnerResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    null
            );
        }
    }

    public record FileShareItemResponse(
            String email,
            String role,
            String addedAt
    ) {
        public static FileShareItemResponse from(FileShareEntity entity) {
            return new FileShareItemResponse(
                    entity.getEmail(),
                    entity.getRole(),
                    entity.getCreatedAt() != null ? entity.getCreatedAt().format(ISO_FORMATTER) : null
            );
        }
    }

    public record FileResponse(
            String id,
            String name,
            String extension,
            String category,
            String mimeType,
            long size,
            String folderId,
            boolean isFavorite,
            boolean isTrashed,
            String trashedAt,
            String createdAt,
            String updatedAt,
            FileOwnerResponse owner,
            List<FileShareItemResponse> sharedWith,
            String url,
            String thumbnailUrl,
            String description,
            List<String> tags
    ) {
        public static FileResponse from(FileEntity file, String baseUrl) {
            String fileIdStr = String.valueOf(file.getId());
            String downloadUrl = baseUrl + "/files/" + fileIdStr + "/download";
            String previewUrl = baseUrl + "/files/" + fileIdStr + "/preview";

            String thumbnail = null;
            if ("images".equalsIgnoreCase(file.getCategory())) {
                thumbnail = previewUrl;
            }

            List<String> tagList = Collections.emptyList();
            if (file.getTags() != null && !file.getTags().isBlank()) {
                tagList = Arrays.stream(file.getTags().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();
            }

            List<FileShareItemResponse> shares = file.getSharedWith() != null
                    ? file.getSharedWith().stream().map(FileShareItemResponse::from).toList()
                    : Collections.emptyList();

            return new FileResponse(
                    fileIdStr,
                    file.getName(),
                    file.getExtension() != null ? file.getExtension() : "",
                    file.getCategory(),
                    file.getMimeType() != null ? file.getMimeType() : "application/octet-stream",
                    file.getSize(),
                    file.getFolderId() != null ? String.valueOf(file.getFolderId()) : null,
                    Boolean.TRUE.equals(file.getIsFavorite()),
                    Boolean.TRUE.equals(file.getIsTrashed()),
                    file.getTrashedAt() != null ? file.getTrashedAt().format(ISO_FORMATTER) : null,
                    file.getCreatedAt() != null ? file.getCreatedAt().format(ISO_FORMATTER) : null,
                    file.getUpdatedAt() != null ? file.getUpdatedAt().format(ISO_FORMATTER) : null,
                    FileOwnerResponse.from(file.getOwner()),
                    shares,
                    downloadUrl,
                    thumbnail,
                    file.getDescription(),
                    tagList
            );
        }
    }
}
