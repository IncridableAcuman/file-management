package com.hotel.backend.controller;

import com.hotel.backend.dto.AdminStatsDto;
import com.hotel.backend.dto.AdminUserDto;
import com.hotel.backend.dto.NotificationDto;
import com.hotel.backend.entity.enums.NotificationType;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.service.AdminService;
import com.hotel.backend.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminControllerIntegrationTest {

    private MockMvc mockMvc;

    @Mock
    private AdminService adminService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private AdminController adminController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
    }

    @Test
    @DisplayName("Admin controller returns system stats correctly")
    void getStats_Success() throws Exception {
        AdminStatsDto stats = AdminStatsDto.builder()
                .totalUsers(10)
                .activeUsers(9)
                .disabledUsers(1)
                .adminUsers(2)
                .regularUsers(8)
                .totalFiles(50)
                .totalFolders(12)
                .totalStorageUsed(2048000L)
                .averageFileSize(40960.0)
                .categoryStats(List.of())
                .topStorageUsers(List.of())
                .build();

        when(adminService.getAdminStats()).thenReturn(stats);

        mockMvc.perform(get("/admin/stats")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10))
                .andExpect(jsonPath("$.activeUsers").value(9))
                .andExpect(jsonPath("$.totalFiles").value(50))
                .andExpect(jsonPath("$.totalStorageUsed").value(2048000));
    }

    @Test
    @DisplayName("Admin controller returns all users with stats")
    void getUsers_Success() throws Exception {
        AdminUserDto user1 = AdminUserDto.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .role("USER")
                .enabled(true)
                .totalFiles(5)
                .totalFolders(2)
                .totalStorageUsed(102400L)
                .build();

        when(adminService.getAllUsersWithStats()).thenReturn(List.of(user1));

        mockMvc.perform(get("/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("john_doe"))
                .andExpect(jsonPath("$[0].email").value("john@example.com"))
                .andExpect(jsonPath("$[0].totalFiles").value(5));
    }

    @Test
    @DisplayName("Admin controller updates user status")
    void setUserStatus_Success() throws Exception {
        AdminUserDto updated = AdminUserDto.builder()
                .id(2L)
                .username("jane_doe")
                .email("jane@example.com")
                .role("USER")
                .enabled(false)
                .build();

        when(adminService.setUserStatus(2L, false)).thenReturn(updated);

        mockMvc.perform(patch("/admin/users/2/status")
                        .param("enabled", "false")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
    }

    @Test
    @DisplayName("Admin controller updates user role")
    void setUserRole_Success() throws Exception {
        AdminUserDto updated = AdminUserDto.builder()
                .id(2L)
                .username("jane_doe")
                .email("jane@example.com")
                .role("ADMIN")
                .enabled(true)
                .build();

        when(adminService.changeUserRole(eq(2L), eq(RoleType.ADMIN))).thenReturn(updated);

        mockMvc.perform(patch("/admin/users/2/role")
                        .param("role", "ADMIN")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Admin controller deletes a user")
    void deleteUser_Success() throws Exception {
        mockMvc.perform(delete("/admin/users/3")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("Admin controller sends notification")
    void sendNotification_Success() throws Exception {
        NotificationDto.NotificationResponse resp = new NotificationDto.NotificationResponse(
                1L,
                "New Feature Announcement",
                "Dark mode is now live!",
                NotificationType.INFO,
                false,
                true,
                LocalDateTime.now(),
                null,
                null,
                null
        );

        when(notificationService.sendNotification(any(NotificationDto.SendNotificationRequest.class)))
                .thenReturn(List.of(resp));

        String requestBody = """
                {
                    "title": "New Feature Announcement",
                    "message": "Dark mode is now live!",
                    "type": "INFO",
                    "isBroadcast": true
                }
                """;

        mockMvc.perform(post("/admin/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("New Feature Announcement"))
                .andExpect(jsonPath("$[0].isBroadcast").value(true));
    }
}
