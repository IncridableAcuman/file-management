package com.hotel.backend.service;

import com.hotel.backend.dto.NotificationDto;
import com.hotel.backend.entity.NotificationEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.NotificationType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.NotificationRepository;
import com.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<NotificationDto.NotificationResponse> sendNotification(NotificationDto.SendNotificationRequest request) {
        NotificationType type = request.getType() != null ? request.getType() : NotificationType.INFO;
        boolean isBroadcast = Boolean.TRUE.equals(request.getIsBroadcast()) || request.getRecipientId() == null;

        List<NotificationEntity> toSave = new ArrayList<>();

        if (isBroadcast) {
            List<UserEntity> users = userRepository.findAll();
            if (users.isEmpty()) {
                throw new CustomBadRequestException("No users found to send broadcast notification");
            }
            for (UserEntity user : users) {
                NotificationEntity notification = NotificationEntity.builder()
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type(type)
                        .recipient(user)
                        .isBroadcast(true)
                        .isRead(false)
                        .build();
                toSave.add(notification);
            }
        } else {
            UserEntity recipient = userRepository.findById(request.getRecipientId())
                    .orElseThrow(() -> new CustomNotFoundException("Recipient user not found with id: " + request.getRecipientId()));

            NotificationEntity notification = NotificationEntity.builder()
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type(type)
                    .recipient(recipient)
                    .isBroadcast(false)
                    .isRead(false)
                    .build();
            toSave.add(notification);
        }

        List<NotificationEntity> saved = notificationRepository.saveAll(toSave);
        return saved.stream()
                .map(NotificationDto.NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificationDto.NotificationResponse> getUserNotifications(UserEntity user) {
        return notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user).stream()
                .map(NotificationDto.NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(UserEntity user) {
        return notificationRepository.countByRecipientAndIsReadFalse(user);
    }

    @Transactional
    public NotificationDto.NotificationResponse markAsRead(Long id, UserEntity user) {
        NotificationEntity notification = notificationRepository.findByIdAndRecipient(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Notification not found with id: " + id));
        notification.setIsRead(true);
        NotificationEntity updated = notificationRepository.save(notification);
        return NotificationDto.NotificationResponse.from(updated);
    }

    @Transactional
    public void markAllAsRead(UserEntity user) {
        notificationRepository.markAllAsReadByRecipient(user);
    }

    @Transactional
    public void deleteNotification(Long id, UserEntity user) {
        NotificationEntity notification = notificationRepository.findByIdAndRecipient(id, user)
                .orElseThrow(() -> new CustomNotFoundException("Notification not found with id: " + id));
        notificationRepository.delete(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto.NotificationResponse> getAllSentNotifications() {
        return notificationRepository.findTop100ByOrderByCreatedAtDesc().stream()
                .map(NotificationDto.NotificationResponse::from)
                .toList();
    }
}
