package com.hotel.backend.service;

import com.hotel.backend.dto.FolderDto;
import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.FolderEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.FileRepository;
import com.hotel.backend.repository.FolderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FolderServiceTest {

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private FileRepository fileRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private FolderService folderService;

    private UserEntity user;
    private FolderEntity sampleFolder;

    @BeforeEach
    void setUp() {
        user = UserEntity.builder()
                .id(1L)
                .username("john_doe")
                .email("john@example.com")
                .enabled(true)
                .build();

        sampleFolder = FolderEntity.builder()
                .id(10L)
                .name("Projects")
                .parentId(null)
                .color("#3b82f6")
                .isFavorite(false)
                .isTrashed(false)
                .owner(user)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getFolders returns active folders by default with counts and sizes")
    void getFolders_DefaultActive() {
        when(folderRepository.findAllByOwnerAndIsTrashed(user, false)).thenReturn(List.of(sampleFolder));
        when(fileRepository.countByFolderIdAndIsTrashedFalse(10L)).thenReturn(3L);
        when(fileRepository.sumSizeByFolderIdAndIsTrashedFalse(10L)).thenReturn(1024L);

        List<FolderDto.FolderResponse> result = folderService.getFolders(user, false, false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Projects");
        assertThat(result.get(0).fileCount()).isEqualTo(3L);
        assertThat(result.get(0).totalSize()).isEqualTo(1024L);
        verify(folderRepository, times(1)).findAllByOwnerAndIsTrashed(user, false);
    }

    @Test
    @DisplayName("getFolders returns favorite folders when favorite is true")
    void getFolders_FavoriteTrue() {
        sampleFolder.setIsFavorite(true);
        when(folderRepository.findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(user)).thenReturn(List.of(sampleFolder));
        when(fileRepository.countByFolderIdAndIsTrashedFalse(10L)).thenReturn(0L);
        when(fileRepository.sumSizeByFolderIdAndIsTrashedFalse(10L)).thenReturn(null);

        List<FolderDto.FolderResponse> result = folderService.getFolders(user, false, true);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isFavorite()).isTrue();
        assertThat(result.get(0).totalSize()).isEqualTo(0L);
        verify(folderRepository, times(1)).findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(user);
    }

    @Test
    @DisplayName("getFolders returns trashed folders when trashed is true")
    void getFolders_TrashedTrue() {
        sampleFolder.setIsTrashed(true);
        when(folderRepository.findAllByOwnerAndIsTrashed(user, true)).thenReturn(List.of(sampleFolder));
        when(fileRepository.countByFolderIdAndIsTrashedFalse(10L)).thenReturn(0L);
        when(fileRepository.sumSizeByFolderIdAndIsTrashedFalse(10L)).thenReturn(0L);

        List<FolderDto.FolderResponse> result = folderService.getFolders(user, true, false);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isTrashed()).isTrue();
        verify(folderRepository, times(1)).findAllByOwnerAndIsTrashed(user, true);
    }

    @Test
    @DisplayName("getFolderById returns folder if exists and belongs to user")
    void getFolderById_Success() {
        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(fileRepository.countByFolderIdAndIsTrashedFalse(10L)).thenReturn(2L);
        when(fileRepository.sumSizeByFolderIdAndIsTrashedFalse(10L)).thenReturn(2048L);

        FolderDto.FolderResponse response = folderService.getFolderById(10L, user);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("10");
        assertThat(response.name()).isEqualTo("Projects");
        assertThat(response.fileCount()).isEqualTo(2L);
        assertThat(response.totalSize()).isEqualTo(2048L);
    }

    @Test
    @DisplayName("getFolderById throws CustomNotFoundException when folder does not exist")
    void getFolderById_NotFound_ThrowsException() {
        when(folderRepository.findByIdAndOwner(999L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> folderService.getFolderById(999L, user))
                .isInstanceOf(CustomNotFoundException.class)
                .hasMessageContaining("Folder not found with id: 999");
    }

    @Test
    @DisplayName("createFolder successfully creates root folder")
    void createFolder_Root_Success() {
        FolderDto.FolderCreateRequest request = new FolderDto.FolderCreateRequest();
        request.setName("Documents");
        request.setColor("#10b981");

        when(folderRepository.save(any(FolderEntity.class))).thenAnswer(invocation -> {
            FolderEntity f = invocation.getArgument(0);
            f.setId(20L);
            f.setCreatedAt(LocalDateTime.now());
            f.setUpdatedAt(LocalDateTime.now());
            return f;
        });

        FolderDto.FolderResponse response = folderService.createFolder(request, user);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("20");
        assertThat(response.name()).isEqualTo("Documents");
        assertThat(response.color()).isEqualTo("#10b981");
        assertThat(response.parentId()).isNull();
        verify(folderRepository, times(1)).save(any(FolderEntity.class));
    }

    @Test
    @DisplayName("createFolder successfully creates subfolder when parent exists")
    void createFolder_Subfolder_Success() {
        FolderDto.FolderCreateRequest request = new FolderDto.FolderCreateRequest();
        request.setName("Invoices");
        request.setParentId(10L);

        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(folderRepository.save(any(FolderEntity.class))).thenAnswer(invocation -> {
            FolderEntity f = invocation.getArgument(0);
            f.setId(21L);
            f.setCreatedAt(LocalDateTime.now());
            f.setUpdatedAt(LocalDateTime.now());
            return f;
        });

        FolderDto.FolderResponse response = folderService.createFolder(request, user);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("21");
        assertThat(response.name()).isEqualTo("Invoices");
        assertThat(response.parentId()).isEqualTo("10");
        assertThat(response.color()).isEqualTo("#3b82f6"); // default color
    }

    @Test
    @DisplayName("createFolder throws CustomNotFoundException when parent folder not found")
    void createFolder_ParentNotFound_ThrowsException() {
        FolderDto.FolderCreateRequest request = new FolderDto.FolderCreateRequest();
        request.setName("Sub");
        request.setParentId(999L);

        when(folderRepository.findByIdAndOwner(999L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> folderService.createFolder(request, user))
                .isInstanceOf(CustomNotFoundException.class)
                .hasMessageContaining("Parent folder not found");
        verify(folderRepository, never()).save(any(FolderEntity.class));
    }

    @Test
    @DisplayName("renameFolder renames folder successfully")
    void renameFolder_Success() {
        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(folderRepository.save(any(FolderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileRepository.countByFolderIdAndIsTrashedFalse(10L)).thenReturn(1L);
        when(fileRepository.sumSizeByFolderIdAndIsTrashedFalse(10L)).thenReturn(500L);

        FolderDto.FolderResponse response = folderService.renameFolder(10L, "  Archived Projects  ", user);

        assertThat(response.name()).isEqualTo("Archived Projects");
        assertThat(sampleFolder.getName()).isEqualTo("Archived Projects");
        verify(folderRepository, times(1)).save(sampleFolder);
    }

    @Test
    @DisplayName("renameFolder throws CustomNotFoundException when folder does not exist")
    void renameFolder_NotFound_ThrowsException() {
        when(folderRepository.findByIdAndOwner(999L, user)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> folderService.renameFolder(999L, "New Name", user))
                .isInstanceOf(CustomNotFoundException.class);
    }

    @Test
    @DisplayName("toggleFavorite toggles favorite flag")
    void toggleFavorite_Success() {
        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(folderRepository.save(any(FolderEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FolderDto.FolderResponse response = folderService.toggleFavorite(10L, user);

        assertThat(response.isFavorite()).isTrue();
        assertThat(sampleFolder.getIsFavorite()).isTrue();

        // Toggle back
        FolderDto.FolderResponse response2 = folderService.toggleFavorite(10L, user);
        assertThat(response2.isFavorite()).isFalse();
    }

    @Test
    @DisplayName("moveToTrash moves folder and its child files to trash")
    void moveToTrash_Success() {
        FileEntity childFile = FileEntity.builder()
                .id(100L)
                .name("notes.txt")
                .folderId(10L)
                .isTrashed(false)
                .owner(user)
                .build();

        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(fileRepository.findAllByFolderIdAndOwnerAndIsTrashedFalse(10L, user)).thenReturn(List.of(childFile));

        folderService.moveToTrash(10L, user);

        assertThat(sampleFolder.getIsTrashed()).isTrue();
        assertThat(sampleFolder.getTrashedAt()).isNotNull();
        assertThat(childFile.getIsTrashed()).isTrue();
        assertThat(childFile.getTrashedAt()).isNotNull();

        verify(folderRepository, times(1)).save(sampleFolder);
        verify(fileRepository, times(1)).save(childFile);
    }

    @Test
    @DisplayName("restoreFromTrash restores folder and its child files from trash")
    void restoreFromTrash_Success() {
        sampleFolder.setIsTrashed(true);
        sampleFolder.setTrashedAt(LocalDateTime.now());

        FileEntity childFile = FileEntity.builder()
                .id(100L)
                .name("notes.txt")
                .folderId(10L)
                .isTrashed(true)
                .trashedAt(LocalDateTime.now())
                .owner(user)
                .build();

        FileEntity otherTrashedFile = FileEntity.builder()
                .id(101L)
                .name("other.txt")
                .folderId(99L)
                .isTrashed(true)
                .trashedAt(LocalDateTime.now())
                .owner(user)
                .build();

        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(fileRepository.findAllByOwnerAndIsTrashed(user, true)).thenReturn(List.of(childFile, otherTrashedFile));

        folderService.restoreFromTrash(10L, user);

        assertThat(sampleFolder.getIsTrashed()).isFalse();
        assertThat(sampleFolder.getTrashedAt()).isNull();

        assertThat(childFile.getIsTrashed()).isFalse();
        assertThat(childFile.getTrashedAt()).isNull();

        // Other file should remain trashed
        assertThat(otherTrashedFile.getIsTrashed()).isTrue();

        verify(folderRepository, times(1)).save(sampleFolder);
        verify(fileRepository, times(1)).save(childFile);
        verify(fileRepository, never()).save(otherTrashedFile);
    }

    @Test
    @DisplayName("deletePermanently removes folder and physical child files")
    void deletePermanently_Success() {
        FileEntity childFile = FileEntity.builder()
                .id(100L)
                .name("invoice.pdf")
                .filePath("1/uuid.pdf")
                .folderId(10L)
                .owner(user)
                .build();

        FileEntity unrelatedFile = FileEntity.builder()
                .id(101L)
                .name("other.pdf")
                .filePath("1/other.pdf")
                .folderId(55L)
                .owner(user)
                .build();

        when(folderRepository.findByIdAndOwner(10L, user)).thenReturn(Optional.of(sampleFolder));
        when(fileRepository.findAllByOwner(user)).thenReturn(List.of(childFile, unrelatedFile));

        folderService.deletePermanently(10L, user);

        verify(fileStorageService, times(1)).deletePhysicalFile("1/uuid.pdf");
        verify(fileStorageService, never()).deletePhysicalFile("1/other.pdf");
        verify(fileRepository, times(1)).delete(childFile);
        verify(folderRepository, times(1)).delete(sampleFolder);
    }
}
