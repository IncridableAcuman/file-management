package com.hotel.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "files")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class FileEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "stored_name", nullable = false)
    private String storedName;

    @Column(name = "extension")
    private String extension;

    @Column(name = "category", nullable = false)
    private String category; // documents, images, videos, audio, archives, code, other

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "size", nullable = false)
    private Long size; // bytes

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "folder_id")
    private Long folderId;

    @Column(name = "is_favorite")
    @Builder.Default
    private Boolean isFavorite = false;

    @Column(name = "is_trashed")
    @Builder.Default
    private Boolean isTrashed = false;

    @Column(name = "trashed_at")
    private LocalDateTime trashedAt;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "tags")
    private String tags;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity owner;

    @OneToMany(mappedBy = "file", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FileShareEntity> sharedWith = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.isFavorite == null) this.isFavorite = false;
        if (this.isTrashed == null) this.isTrashed = false;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
