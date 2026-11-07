package com.hotel.backend.repository;

import com.hotel.backend.entity.FolderEntity;
import com.hotel.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<FolderEntity, Long> {
    List<FolderEntity> findAllByOwnerAndIsTrashed(UserEntity owner, Boolean isTrashed);

    List<FolderEntity> findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(UserEntity owner);

    List<FolderEntity> findAllByOwner(UserEntity owner);

    Optional<FolderEntity> findByIdAndOwner(Long id, UserEntity owner);

    long countByIsTrashedFalse();

    long countByOwnerAndIsTrashedFalse(UserEntity owner);

    void deleteAllByOwnerAndIsTrashedTrue(UserEntity owner);

    void deleteAllByOwner(UserEntity owner);
}
