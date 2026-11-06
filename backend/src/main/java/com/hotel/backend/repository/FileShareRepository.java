package com.hotel.backend.repository;

import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.FileShareEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileShareRepository extends JpaRepository<FileShareEntity, Long> {
    List<FileShareEntity> findAllByFile(FileEntity file);

    Optional<FileShareEntity> findByFileAndEmail(FileEntity file, String email);

    void deleteAllByFile(FileEntity file);
}
