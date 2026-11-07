package com.hotel.backend.config;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            // Check if any admin exists
            long adminCount = userRepository.countByRole_Type(RoleType.ADMIN);
            if (adminCount == 0) {
                log.info("No admin found in system. Creating default administrator...");
                UserEntity admin = UserEntity.builder()
                        .username("admin")
                        .email("admin@filevault.com")
                        .password(passwordEncoder.encode("admin2003"))
                        .enabled(true)
                        .build();

                RoleEntity adminRole = RoleEntity.builder()
                        .user(admin)
                        .type(RoleType.ADMIN)
                        .build();

                admin.setRole(adminRole);
                userRepository.save(admin);
                log.info("Default administrator created successfully: admin@filevault.com / admin2003");
            }
        } catch (Exception e) {
            log.warn("DataInitializer skipped or encountered an issue: {}", e.getMessage());
        }
    }
}
