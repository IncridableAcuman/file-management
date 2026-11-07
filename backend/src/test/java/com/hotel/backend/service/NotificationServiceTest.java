package com.hotel.backend.service;

import com.hotel.backend.dto.NotificationDto;
import com.hotel.backend.entity.NotificationEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.NotificationType;
import com.hotel.backend.repository.NotificationRepository;
import com.hotel.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private NotificationService notificationService;

    private UserEntity user1;
    private UserEntity user2;

    @BeforeEach
    void setUp() {
        user1 = UserEntity.builder()
                .id(1L)
                .username("user1")
                .email("user1@test.com")
                .enabled(true)
                .build();

        user2 = UserEntity.builder()
                .id(2L)
                .username("user2")
                .email("user2@test.com")
                .enabled(true)
                .build();
    }

    @Test
    @DisplayName("Send broadcast notification to all users")
    void sendNotification_Broadcast_Success() {
        when(userRepository.findAll()).thenReturn(List.of(user1, user2));
        when(notificationRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationDto.SendNotificationRequest request = NotificationDto.SendNotificationRequest.builder()
                .title("System Maintenance")
                .message("Servers will undergo maintenance tonight at 00:00 UTC")
                .type(NotificationType.ALERT)
                .isBroadcast(true)
                .build();

        List<NotificationDto.NotificationResponse> responses = notificationService.sendNotification(request);

        assertThat(responses).hasSize(2);
        assertThat(responses.get(0).title()).isEqualTo("System Maintenance");
        assertThat(responses.get(0).type()).isEqualTo(NotificationType.ALERT);
        assertThat(responses.get(0).isBroadcast()).isTrue();
        verify(notificationRepository, times(1)).saveAll(anyList());
    }

    @Test
    @DisplayName("Send direct notification to a specific user")
    void sendNotification_Direct_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(notificationRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationDto.SendNotificationRequest request = NotificationDto.SendNotificationRequest.builder()
                .title("Account Upgrade")
                .message("Your account has been upgraded to Premium")
                .type(NotificationType.SUCCESS)
                .recipientId(1L)
                .isBroadcast(false)
                .build();

        List<NotificationDto.NotificationResponse> responses = notificationService.sendNotification(request);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).recipientEmail()).isEqualTo("user1@test.com");
        assertThat(responses.get(0).isBroadcast()).isFalse();
    }

    @Test
    @DisplayName("Get notifications for a user")
    void getUserNotifications_Success() {
        NotificationEntity n1 = NotificationEntity.builder()
                .id(101L)
                .title("Welcome")
                .message("Welcome to FileVault")
                .type(NotificationType.INFO)
                .recipient(user1)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        when(notificationRepository.findAllByRecipientOrderByCreatedAtDesc(user1)).thenReturn(List.of(n1));

        List<NotificationDto.NotificationResponse> list = notificationService.getUserNotifications(user1);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).title()).isEqualTo("Welcome");
        assertThat(list.get(0).isRead()).isFalse();
    }

    @Test
    @DisplayName("Get unread notifications count for a user")
    void getUnreadCount_Success() {
        when(notificationRepository.countByRecipientAndIsReadFalse(user1)).thenReturn(3L);

        long count = notificationService.getUnreadCount(user1);

        assertThat(count).isEqualTo(3L);
        verify(notificationRepository, times(1)).countByRecipientAndIsReadFalse(user1);
    }

    @Test
    @DisplayName("Mark notification as read")
    void markAsRead_Success() {
        NotificationEntity n1 = NotificationEntity.builder()
                .id(101L)
                .title("Notice")
                .message("Storage warning")
                .type(NotificationType.WARNING)
                .recipient(user1)
                .isRead(false)
                .build();

        when(notificationRepository.findByIdAndRecipient(101L, user1)).thenReturn(Optional.of(n1));
        when(notificationRepository.save(any(NotificationEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        NotificationDto.NotificationResponse response = notificationService.markAsRead(101L, user1);

        assertThat(response.isRead()).isTrue();
        verify(notificationRepository, times(1)).save(n1);
    }

    @Test
    @DisplayName("Mark all notifications as read for a user")
    void markAllAsRead_Success() {
        notificationService.markAllAsRead(user1);

        verify(notificationRepository, times(1)).markAllAsReadByRecipient(user1);
    }

    @Test
    @DisplayName("Delete notification for a user")
    void deleteNotification_Success() {
        NotificationEntity n1 = NotificationEntity.builder()
                .id(101L)
                .recipient(user1)
                .build();

        when(notificationRepository.findByIdAndRecipient(101L, user1)).thenReturn(Optional.of(n1));

        notificationService.deleteNotification(101L, user1);

        verify(notificationRepository, times(1)).delete(n1);
    }
}
