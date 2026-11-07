package com.hotel.backend.dto;

import com.hotel.backend.entity.NotificationEntity;
import com.hotel.backend.entity.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class NotificationDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SendNotificationRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 200, message = "Title cannot exceed 200 characters")
        private String title;

        @NotBlank(message = "Message is required")
        @Size(max = 2000, message = "Message cannot exceed 2000 characters")
        private String message;

        private NotificationType type;

        private Long recipientId;

        private Boolean isBroadcast;
    }

    public record NotificationResponse(
            Long id,
            String title,
            String message,
            NotificationType type,
            Boolean isRead,
            Boolean isBroadcast,
            LocalDateTime createdAt,
            Long recipientId,
            String recipientEmail,
            String recipientUsername
    ) {
        public static NotificationResponse from(NotificationEntity entity) {
            return new NotificationResponse(
                    entity.getId(),
                    entity.getTitle(),
                    entity.getMessage(),
                    entity.getType(),
                    entity.getIsRead(),
                    entity.getIsBroadcast(),
                    entity.getCreatedAt(),
                    entity.getRecipient() != null ? entity.getRecipient().getId() : null,
                    entity.getRecipient() != null ? entity.getRecipient().getEmail() : null,
                    entity.getRecipient() != null ? entity.getRecipient().getUsername() : null
            );
        }
    }
}
