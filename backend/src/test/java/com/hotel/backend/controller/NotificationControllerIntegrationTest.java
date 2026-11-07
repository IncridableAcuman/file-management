package com.hotel.backend.controller;

import com.hotel.backend.dto.NotificationDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.NotificationType;
import com.hotel.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = UserEntity.builder()
                .id(1L)
                .username("test_user")
                .email("test@filevault.com")
                .enabled(true)
                .build();

        HandlerMethodArgumentResolver userResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.getParameterType().isAssignableFrom(UserEntity.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return testUser;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(notificationController)
                .setCustomArgumentResolvers(userResolver)
                .build();
    }

    @Test
    @DisplayName("User can fetch their notifications")
    void getNotifications_Success() throws Exception {
        NotificationDto.NotificationResponse notif = new NotificationDto.NotificationResponse(
                10L,
                "Welcome",
                "Welcome to the platform",
                NotificationType.INFO,
                false,
                false,
                LocalDateTime.now(),
                1L,
                "test@filevault.com",
                "test_user"
        );

        when(notificationService.getUserNotifications(any())).thenReturn(List.of(notif));

        mockMvc.perform(get("/notifications")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Welcome"))
                .andExpect(jsonPath("$[0].isRead").value(false));
    }

    @Test
    @DisplayName("User can fetch unread count")
    void getUnreadCount_Success() throws Exception {
        when(notificationService.getUnreadCount(any())).thenReturn(5L);

        mockMvc.perform(get("/notifications/unread-count")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(5));
    }

    @Test
    @DisplayName("User can mark a notification as read")
    void markAsRead_Success() throws Exception {
        NotificationDto.NotificationResponse notif = new NotificationDto.NotificationResponse(
                10L,
                "Welcome",
                "Welcome to the platform",
                NotificationType.INFO,
                true,
                false,
                LocalDateTime.now(),
                1L,
                "test@filevault.com",
                "test_user"
        );

        when(notificationService.markAsRead(eq(10L), any())).thenReturn(notif);

        mockMvc.perform(patch("/notifications/10/read")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isRead").value(true));
    }

    @Test
    @DisplayName("User can mark all notifications as read")
    void markAllAsRead_Success() throws Exception {
        mockMvc.perform(patch("/notifications/read-all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("User can delete a notification")
    void deleteNotification_Success() throws Exception {
        mockMvc.perform(delete("/notifications/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}
