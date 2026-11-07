package com.hotel.backend.service;

import com.hotel.backend.dto.AdminStatsDto;
import com.hotel.backend.dto.AdminUserDto;
import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private FileRepository fileRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private TokenRepository tokenRepository;

    @InjectMocks
    private AdminService adminService;

    private UserEntity adminUser;
    private UserEntity normalUser;

    @BeforeEach
    void setUp() {
        adminUser = UserEntity.builder()
                .id(1L)
                .username("admin")
                .email("admin@test.com")
                .password("encoded_pass")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        RoleEntity adminRole = RoleEntity.builder()
                .id(1L)
                .user(adminUser)
                .type(RoleType.ADMIN)
                .build();
        adminUser.setRole(adminRole);

        normalUser = UserEntity.builder()
                .id(2L)
                .username("john_doe")
                .email("john@test.com")
                .password("encoded_pass")
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        RoleEntity userRole = RoleEntity.builder()
                .id(2L)
                .user(normalUser)
                .type(RoleType.USER)
                .build();
        normalUser.setRole(userRole);
    }

    @Test
    @DisplayName("Admin stats should return accurate aggregated statistics")
    void getAdminStats_Success() {
        when(userRepository.count()).thenReturn(2L);
        when(userRepository.countByEnabled(true)).thenReturn(2L);
        when(userRepository.countByEnabled(false)).thenReturn(0L);
        when(userRepository.countByRole_Type(RoleType.ADMIN)).thenReturn(1L);
        when(userRepository.countByRole_Type(RoleType.USER)).thenReturn(1L);

        when(fileRepository.countByIsTrashedFalse()).thenReturn(15L);
        when(fileRepository.countByIsTrashedTrue()).thenReturn(2L);
        when(folderRepository.countByIsTrashedFalse()).thenReturn(5L);
        when(fileRepository.sumTotalSize()).thenReturn(104857600L); // 100 MB

        List<Object[]> rawCatStats = new ArrayList<>();
        rawCatStats.add(new Object[]{"documents", 10L, 52428800L});
        rawCatStats.add(new Object[]{"images", 5L, 52428800L});
        when(fileRepository.getStatsByCategory()).thenReturn(rawCatStats);

        when(userRepository.findAll()).thenReturn(List.of(adminUser, normalUser));
        when(fileRepository.countByOwnerAndIsTrashedFalse(adminUser)).thenReturn(5L);
        when(fileRepository.sumSizeByOwnerAndIsTrashedFalse(adminUser)).thenReturn(2428800L);
        when(fileRepository.countByOwnerAndIsTrashedFalse(normalUser)).thenReturn(10L);
        when(fileRepository.sumSizeByOwnerAndIsTrashedFalse(normalUser)).thenReturn(102428800L);

        AdminStatsDto stats = adminService.getAdminStats();

        assertThat(stats).isNotNull();
        assertThat(stats.getTotalUsers()).isEqualTo(2);
        assertThat(stats.getActiveUsers()).isEqualTo(2);
        assertThat(stats.getTotalFiles()).isEqualTo(15);
        assertThat(stats.getTotalFolders()).isEqualTo(5);
        assertThat(stats.getTotalStorageUsed()).isEqualTo(104857600L);
        assertThat(stats.getTopStorageUsers()).hasSize(2);
        // Top storage user should be normalUser who has more storage used
        assertThat(stats.getTopStorageUsers().get(0).getEmail()).isEqualTo("john@test.com");
    }

    @Test
    @DisplayName("Get all users with their storage and file counts")
    void getAllUsersWithStats_Success() {
        when(userRepository.findAll()).thenReturn(List.of(adminUser, normalUser));
        when(fileRepository.countByOwnerAndIsTrashedFalse(adminUser)).thenReturn(3L);
        when(folderRepository.countByOwnerAndIsTrashedFalse(adminUser)).thenReturn(1L);
        when(fileRepository.sumSizeByOwnerAndIsTrashedFalse(adminUser)).thenReturn(1000L);

        when(fileRepository.countByOwnerAndIsTrashedFalse(normalUser)).thenReturn(7L);
        when(folderRepository.countByOwnerAndIsTrashedFalse(normalUser)).thenReturn(2L);
        when(fileRepository.sumSizeByOwnerAndIsTrashedFalse(normalUser)).thenReturn(5000L);

        List<AdminUserDto> users = adminService.getAllUsersWithStats();

        assertThat(users).hasSize(2);
        assertThat(users.get(0).getUsername()).isEqualTo("admin");
        assertThat(users.get(0).getTotalFiles()).isEqualTo(3);
        assertThat(users.get(1).getUsername()).isEqualTo("john_doe");
        assertThat(users.get(1).getTotalStorageUsed()).isEqualTo(5000L);
    }

    @Test
    @DisplayName("Set user status should disable or enable a user")
    void setUserStatus_Success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(normalUser));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserDto result = adminService.setUserStatus(2L, false);

        assertThat(result.getEnabled()).isFalse();
        verify(userRepository, times(1)).save(normalUser);
    }

    @Test
    @DisplayName("Change user role should update role to ADMIN or USER")
    void changeUserRole_Success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(normalUser));
        when(roleRepository.save(any(RoleEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(UserEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserDto result = adminService.changeUserRole(2L, RoleType.ADMIN);

        assertThat(result.getRole()).isEqualTo("ADMIN");
        verify(roleRepository, times(1)).save(any(RoleEntity.class));
        verify(userRepository, times(1)).save(normalUser);
    }

    @Test
    @DisplayName("Delete user should remove all user associated records")
    void deleteUser_Success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(normalUser));

        adminService.deleteUser(2L);

        verify(notificationRepository, times(1)).deleteAllByRecipient(normalUser);
        verify(tokenRepository, times(1)).deleteByUser(normalUser);
        verify(fileRepository, times(1)).deleteAllByOwner(normalUser);
        verify(folderRepository, times(1)).deleteAllByOwner(normalUser);
        verify(userRepository, times(1)).delete(normalUser);
    }
}
