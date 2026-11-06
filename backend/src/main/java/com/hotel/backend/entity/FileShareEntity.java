package com.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_shares")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FileShareEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id", nullable = false)
    private FileEntity file;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "role", nullable = false) // viewer, editor
    @Builder.Default
    private String role = "viewer";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.role == null) this.role = "viewer";
    }
}
