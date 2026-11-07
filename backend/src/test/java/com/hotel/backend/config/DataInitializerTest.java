package com.hotel.backend.config;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.repository.RoleRepository;
import com.hotel.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.AbstractPlatformTransactionManager;
import org.springframework.transaction.support.DefaultTransactionStatus;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        PlatformTransactionManager transactionManager = new AbstractPlatformTransactionManager() {
            @Override
            protected Object doGetTransaction() {
                return new Object();
            }

            @Override
            protected void doBegin(Object transaction, TransactionDefinition definition) {
            }

            @Override
            protected void doCommit(DefaultTransactionStatus status) {
            }

            @Override
            protected void doRollback(DefaultTransactionStatus status) {
            }
        };

        dataInitializer = new DataInitializer(userRepository, roleRepository, passwordEncoder, transactionManager);
    }

    @Test
    @DisplayName("Should skip initialization if admin already exists")
    void shouldSkipIfAdminAlreadyExists() {
        when(userRepository.countByRole_Type(RoleType.ADMIN)).thenReturn(1L);

        dataInitializer.run();

        verify(userRepository, times(1)).countByRole_Type(RoleType.ADMIN);
        verify(userRepository, never()).save(any(UserEntity.class));
        verify(roleRepository, never()).save(any(RoleEntity.class));
    }

    @Test
    @DisplayName("Should promote existing user to admin if adminCount is zero but admin username exists")
    void shouldPromoteExistingUserToAdmin() {
        UserEntity existingUser = UserEntity.builder()
                .id(1L)
                .username("admin")
                .email("admin@other.com")
                .enabled(false)
                .build();

        when(userRepository.countByRole_Type(RoleType.ADMIN)).thenReturn(0L);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(existingUser));
        when(userRepository.findByEmail("admin@filevault.com")).thenReturn(Optional.empty());

        dataInitializer.run();

        assertThat(existingUser.isEnabled()).isTrue();
        assertThat(existingUser.getRole()).isNotNull();
        assertThat(existingUser.getRole().getType()).isEqualTo(RoleType.ADMIN);

        verify(roleRepository, times(1)).save(any(RoleEntity.class));
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    @DisplayName("Should create default admin if no admin and no user named admin exists")
    void shouldCreateDefaultAdminIfNoneExists() {
        when(userRepository.countByRole_Type(RoleType.ADMIN)).thenReturn(0L);
        when(userRepository.findByUsername("admin")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("admin@filevault.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("admin2003")).thenReturn("encodedPassword");
        when(userRepository.save(any(UserEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        dataInitializer.run();

        verify(passwordEncoder, times(1)).encode("admin2003");
        verify(roleRepository, times(1)).save(any(RoleEntity.class));
        verify(userRepository, times(2)).save(any(UserEntity.class));
    }
}
