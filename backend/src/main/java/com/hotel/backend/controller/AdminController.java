package com.hotel.backend.controller;

import com.hotel.backend.dto.AdminStatsDto;
import com.hotel.backend.dto.AdminUserDto;
import com.hotel.backend.dto.NotificationDto;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.service.AdminService;
import com.hotel.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final NotificationService notificationService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsersWithStats());
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<AdminUserDto> setUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled
    ) {
        return ResponseEntity.ok(adminService.setUserStatus(id, enabled));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDto> setUserRole(
            @PathVariable Long id,
            @RequestParam RoleType role
    ) {
        return ResponseEntity.ok(adminService.changeUserRole(id, role));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/notifications")
    public ResponseEntity<List<NotificationDto.NotificationResponse>> sendNotification(
            @Valid @RequestBody NotificationDto.SendNotificationRequest request
    ) {
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationDto.NotificationResponse>> getSentNotifications() {
        return ResponseEntity.ok(notificationService.getAllSentNotifications());
    }
}
