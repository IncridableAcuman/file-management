package com.hotel.backend.repository;

import com.hotel.backend.entity.NotificationEntity;
import com.hotel.backend.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findAllByRecipientOrderByCreatedAtDesc(UserEntity recipient);

    long countByRecipientAndIsReadFalse(UserEntity recipient);

    Optional<NotificationEntity> findByIdAndRecipient(Long id, UserEntity recipient);

    List<NotificationEntity> findTop100ByOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isRead = true WHERE n.recipient = :recipient AND n.isRead = false")
    void markAllAsReadByRecipient(@Param("recipient") UserEntity recipient);

    void deleteAllByRecipient(UserEntity recipient);
}
