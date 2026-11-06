package com.hotel.backend.repository;

import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findAllByOwnerAndIsTrashed(UserEntity owner, Boolean isTrashed);

    List<FileEntity> findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(UserEntity owner);

    List<FileEntity> findAllByFolderIdAndOwnerAndIsTrashedFalse(Long folderId, UserEntity owner);

    Optional<FileEntity> findByIdAndOwner(Long id, UserEntity owner);

    List<FileEntity> findAllByOwner(UserEntity owner);

    long countByFolderIdAndIsTrashedFalse(Long folderId);

    @Query("SELECT COALESCE(SUM(f.size), 0) FROM FileEntity f WHERE f.folderId = :folderId AND f.isTrashed = false")
    Long sumSizeByFolderIdAndIsTrashedFalse(@Param("folderId") Long folderId);

    @Query("SELECT COALESCE(SUM(f.size), 0) FROM FileEntity f WHERE f.owner = :owner AND f.isTrashed = false")
    Long sumSizeByOwnerAndIsTrashedFalse(@Param("owner") UserEntity owner);

    @Query("SELECT f FROM FileEntity f JOIN f.sharedWith s WHERE s.email = :email AND f.isTrashed = false")
    List<FileEntity> findAllSharedWithEmail(@Param("email") String email);

    void deleteAllByOwnerAndIsTrashedTrue(UserEntity owner);
}
