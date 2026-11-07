package com.hotel.backend.repository;

import com.hotel.backend.entity.TokenEntity;
import com.hotel.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface TokenRepository extends JpaRepository<TokenEntity,Long> {
    Optional<TokenEntity> findByUser(UserEntity user);
    void deleteByUser(UserEntity user);
}
