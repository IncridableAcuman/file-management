package com.hotel.backend.service;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoleService {
    private final RoleRepository roleRepository;

    @Transactional
    public RoleEntity createRole(UserEntity user, RoleType type){
        RoleEntity role = RoleEntity
                .builder()
                .user(user)
                .type(type)
                .build();
        return roleRepository.save(role);
    }
}
