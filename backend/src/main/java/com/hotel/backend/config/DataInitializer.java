package com.hotel.backend.config;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.repository.RoleRepository;
import com.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final PlatformTransactionManager transactionManager;

    @Override
    public void run(String... args) {
        TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
        try {
            transactionTemplate.executeWithoutResult(status -> initializeAdmin());
        } catch (Exception e) {
            log.error("DataInitializer encountered an issue: {}", e.getMessage(), e);
        }
    }

    private void initializeAdmin() {
        long adminCount = userRepository.countByRole_Type(RoleType.ADMIN);
        if (adminCount > 0) {
            log.info("Admin user already exists. Skipping default admin initialization.");
            return;
        }

        log.info("No admin found in system. Checking for existing default administrator account...");
        Optional<UserEntity> adminByUsername = userRepository.findByUsername("admin");
        Optional<UserEntity> adminByEmail = userRepository.findByEmail("admin@filevault.com");

        UserEntity admin = adminByUsername.orElseGet(() -> adminByEmail.orElse(null));

        if (admin != null) {
            log.info("Found existing user '{}'. Promoting to administrator...", admin.getUsername());
            RoleEntity role = admin.getRole();
            if (role == null) {
                role = RoleEntity.builder()
                        .user(admin)
                        .type(RoleType.ADMIN)
                        .build();
                admin.setRole(role);
            } else {
                role.setType(RoleType.ADMIN);
            }
            roleRepository.save(role);
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("User '{}' successfully promoted to administrator.", admin.getUsername());
        } else {
            log.info("Creating default administrator account: admin@filevault.com / admin2003");
            UserEntity newAdmin = UserEntity.builder()
                    .username("admin")
                    .email("admin@filevault.com")
                    .password(passwordEncoder.encode("admin2003"))
                    .enabled(true)
                    .build();

            UserEntity savedAdmin = userRepository.save(newAdmin);

            RoleEntity adminRole = RoleEntity.builder()
                    .user(savedAdmin)
                    .type(RoleType.ADMIN)
                    .build();

            roleRepository.save(adminRole);
            savedAdmin.setRole(adminRole);
            userRepository.save(savedAdmin);
            log.info("Default administrator created successfully: admin@filevault.com / admin2003");
        }
    }
}
