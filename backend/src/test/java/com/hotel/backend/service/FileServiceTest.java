package com.hotel.backend.service;

import com.hotel.backend.dto.FileDto;
import com.hotel.backend.dto.StorageStatsDto;
import com.hotel.backend.entity.FileEntity;
import com.hotel.backend.entity.FileShareEntity;
import com.hotel.backend.entity.FolderEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.FileRepository;
import com.hotel.backend.repository.FileShareRepository;
import com.hotel.backend.repository.FolderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServiceTest {

    @Mock
    private FileRepository fileRepository;

    @Mock
    private FolderRepository folderRepository;

    @Mock
    private FileShareRepository fileShareRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private FileService fileService;

    private UserEntity owner;
    private UserEntity otherUser;
    private FileEntity sampleFile;

    @BeforeEach
    void setUp() {
        owner = UserEntity.builder()
                .id(1L)
                .username("owner")
                .email("owner@test.com")
                .enabled(true)
                .build();

        otherUser = UserEntity.builder()
                .id(2L)
                .username("other")
                .email("other@test.com")
                .enabled(true)
                .build();

        sampleFile = FileEntity.builder()
                .id(100L)
                .name("report.pdf")
                .storedName("uuid-report.pdf")
                .extension("pdf")
                .category("documents")
                .mimeType("application/pdf")
                .size(1024L)
                .filePath("1/uuid-report.pdf")
                .folderId(10L)
                .isFavorite(false)
                .isTrashed(false)
                .tags("finance, annual")
                .owner(owner)
                .sharedWith(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("getFiles returns active files sorted by updatedAt desc")
    void getFiles_ActiveFiles() {
        FileEntity olderFile = FileEntity.builder()
                .id(101L)
                .name("old.txt")
                .extension("txt")
                .category("documents")
                .size(100L)
                .filePath("1/old.txt")
                .owner(owner)
                .sharedWith(new ArrayList<>())
                .createdAt(LocalDateTime.now().minusDays(5))
                .updatedAt(LocalDateTime.now().minusDays(4))
                .build();

        when(fileRepository.findAllByOwnerAndIsTrashed(owner, false))
                .thenReturn(List.of(olderFile, sampleFile));

        List<FileDto.FileResponse> result = fileService.getFiles(owner, null, null, false, false, null);

        assertThat(result).hasSize(2);
        // sampleFile has newer updatedAt so should be first
        assertThat(result.get(0).id()).isEqualTo("100");
        assertThat(result.get(1).id()).isEqualTo("101");
    }

    @Test
    @DisplayName("getFiles filters by category")
    void getFiles_FilterByCategory() {
        FileEntity imageFile = FileEntity.builder()
                .id(102L)
                .name("photo.jpg")
                .extension("jpg")
                .category("images")
                .size(2048L)
                .filePath("1/photo.jpg")
                .owner(owner)
                .sharedWith(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(fileRepository.findAllByOwnerAndIsTrashed(owner, false))
                .thenReturn(List.of(sampleFile, imageFile));

        List<FileDto.FileResponse> docs = fileService.getFiles(owner, "documents", null, false, false, null);
        assertThat(docs).hasSize(1);
        assertThat(docs.get(0).category()).isEqualTo("documents");

        List<FileDto.FileResponse> all = fileService.getFiles(owner, "all", null, false, false, null);
        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("getFiles filters by folderId")
    void getFiles_FilterByFolderId() {
        FileEntity otherFolderFile = FileEntity.builder()
                .id(103L)
                .name("other.pdf")
                .folderId(20L)
                .category("documents")
                .size(500L)
                .filePath("1/other.pdf")
                .owner(owner)
                .sharedWith(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(fileRepository.findAllByOwnerAndIsTrashed(owner, false))
                .thenReturn(List.of(sampleFile, otherFolderFile));

        List<FileDto.FileResponse> result = fileService.getFiles(owner, null, 10L, false, false, null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).folderId()).isEqualTo("10");
    }

    @Test
    @DisplayName("getFiles filters by search matching name, extension, or tags")
    void getFiles_FilterBySearch() {
        when(fileRepository.findAllByOwnerAndIsTrashed(owner, false))
                .thenReturn(List.of(sampleFile));

        // Match by name
        List<FileDto.FileResponse> searchName = fileService.getFiles(owner, null, null, false, false, "report");
        assertThat(searchName).hasSize(1);

        // Match by extension
        List<FileDto.FileResponse> searchExt = fileService.getFiles(owner, null, null, false, false, "pdf");
        assertThat(searchExt).hasSize(1);

        // Match by tags
        List<FileDto.FileResponse> searchTag = fileService.getFiles(owner, null, null, false, false, "annual");
        assertThat(searchTag).hasSize(1);

        // Non match
        List<FileDto.FileResponse> noMatch = fileService.getFiles(owner, null, null, false, false, "music");
        assertThat(noMatch).isEmpty();
    }

    @Test
    @DisplayName("getFiles returns favorite files when favorite=true")
    void getFiles_FavoriteTrue() {
        sampleFile.setIsFavorite(true);
        when(fileRepository.findAllByOwnerAndIsFavoriteTrueAndIsTrashedFalse(owner))
                .thenReturn(List.of(sampleFile));

        List<FileDto.FileResponse> result = fileService.getFiles(owner, null, null, false, true, null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).isFavorite()).isTrue();
    }

    @Test
    @DisplayName("getFiles returns trashed files when trashed=true")
    void getFiles_TrashedTrue() {
        sampleFile.setIsTrashed(true);
        when(fileRepository.findAllByOwnerAndIsTrashed(owner, true))
                .thenReturn(List.of(sampleFile));

        List<FileDto.FileResponse> result = fileService.getFiles(owner, null, null, true, false, null);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).isTrashed()).isTrue();
    }

    @Test
    @DisplayName("getSharedFiles returns files shared with user's email")
    void getSharedFiles_Success() {
        when(fileRepository.findAllSharedWithEmail(owner.getEmail())).thenReturn(List.of(sampleFile));

        List<FileDto.FileResponse> result = fileService.getSharedFiles(owner);
        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo("100");
    }

    @Test
    @DisplayName("getFileById returns file for owner")
    void getFileById_Owner_Success() {
        when(fileRepository.findById(100L)).thenReturn(Optional.of(sampleFile));

        FileDto.FileResponse response = fileService.getFileById(100L, owner);
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("100");
    }

    @Test
    @DisplayName("getFileById returns file for shared user")
    void getFileById_SharedUser_Success() {
        FileShareEntity share = FileShareEntity.builder()
                .file(sampleFile)
                .email(otherUser.getEmail())
                .role("viewer")
                .build();
        sampleFile.getSharedWith().add(share);

        when(fileRepository.findById(100L)).thenReturn(Optional.of(sampleFile));

        FileDto.FileResponse response = fileService.getFileById(100L, otherUser);
        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo("100");
    }

    @Test
    @DisplayName("getFileById throws CustomNotFoundException when unauthorized")
    void getFileById_Unauthorized_ThrowsException() {
        when(fileRepository.findById(100L)).thenReturn(Optional.of(sampleFile));

        assertThatThrownBy(() -> fileService.getFileById(100L, otherUser))
                .isInstanceOf(CustomNotFoundException.class)
                .hasMessageContaining("File not found with id: 100");
    }

    @Test
    @DisplayName("uploadFiles throws CustomBadRequestException when file list is empty")
    void uploadFiles_EmptyList_ThrowsException() {
        assertThatThrownBy(() -> fileService.uploadFiles(List.of(), null, owner))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("No files provided for upload");
    }

    @Test
    @DisplayName("uploadFiles throws CustomNotFoundException when target folder doesn't exist")
    void uploadFiles_FolderNotFound_ThrowsException() {
        MockMultipartFile file = new MockMultipartFile("files", "test.txt", "text/plain", "abc".getBytes());
        when(folderRepository.findByIdAndOwner(999L, owner)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> fileService.uploadFiles(List.of(file), 999L, owner))
                .isInstanceOf(CustomNotFoundException.class)
                .hasMessageContaining("Folder not found with id: 999");
    }

    @Test
    @DisplayName("uploadFiles successfully stores files and creates entities")
    void uploadFiles_Success() {
        MockMultipartFile file1 = new MockMultipartFile("files", "doc1.txt", "text/plain", "abc".getBytes());
        MockMultipartFile emptyFile = new MockMultipartFile("files", "empty.txt", "text/plain", new byte[0]);

        FileStorageService.StoredFileInfo info = new FileStorageService.StoredFileInfo(
                "doc1.txt",
                "uuid-doc1.txt",
                "1/uuid-doc1.txt",
                "txt",
                "documents",
                3L
        );

        when(fileStorageService.storeFile(file1, owner.getId())).thenReturn(info);
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> {
            FileEntity f = invocation.getArgument(0);
            f.setId(201L);
            f.setCreatedAt(LocalDateTime.now());
            f.setUpdatedAt(LocalDateTime.now());
            return f;
        });

        List<FileDto.FileResponse> responses = fileService.uploadFiles(List.of(file1, emptyFile), null, owner);

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).name()).isEqualTo("doc1.txt");
        assertThat(responses.get(0).category()).isEqualTo("documents");
        verify(fileRepository, times(1)).save(any(FileEntity.class));
    }

    @Test
    @DisplayName("getFileResource returns Resource for owner or shared user")
    void getFileResource_Success() {
        Resource mockResource = new ByteArrayResource("content".getBytes());
        when(fileRepository.findById(100L)).thenReturn(Optional.of(sampleFile));
        when(fileStorageService.loadFileAsResource("1/uuid-report.pdf")).thenReturn(mockResource);

        FileService.FileResourcePayload payload = fileService.getFileResource(100L, owner);

        assertThat(payload).isNotNull();
        assertThat(payload.resource()).isEqualTo(mockResource);
        assertThat(payload.file()).isEqualTo(sampleFile);
    }

    @Test
    @DisplayName("renameFile updates filename and preserves extension")
    void renameFile_PreservesExtension() {
        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Rename without extension provided
        FileDto.FileResponse resp1 = fileService.renameFile(100L, "NewReport", owner);
        assertThat(resp1.name()).isEqualTo("NewReport.pdf");

        // Rename with extension already provided
        FileDto.FileResponse resp2 = fileService.renameFile(100L, "UpdatedReport.pdf", owner);
        assertThat(resp2.name()).isEqualTo("UpdatedReport.pdf");
    }

    @Test
    @DisplayName("toggleFavorite toggles favorite boolean on file")
    void toggleFavorite_Success() {
        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FileDto.FileResponse resp1 = fileService.toggleFavorite(100L, owner);
        assertThat(resp1.isFavorite()).isTrue();

        FileDto.FileResponse resp2 = fileService.toggleFavorite(100L, owner);
        assertThat(resp2.isFavorite()).isFalse();
    }

    @Test
    @DisplayName("moveToTrash marks file as trashed")
    void moveToTrash_Success() {
        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));

        fileService.moveToTrash(100L, owner);

        assertThat(sampleFile.getIsTrashed()).isTrue();
        assertThat(sampleFile.getTrashedAt()).isNotNull();
        verify(fileRepository, times(1)).save(sampleFile);
    }

    @Test
    @DisplayName("restoreFromTrash unmarks file as trashed")
    void restoreFromTrash_Success() {
        sampleFile.setIsTrashed(true);
        sampleFile.setTrashedAt(LocalDateTime.now());
        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));

        fileService.restoreFromTrash(100L, owner);

        assertThat(sampleFile.getIsTrashed()).isFalse();
        assertThat(sampleFile.getTrashedAt()).isNull();
        verify(fileRepository, times(1)).save(sampleFile);
    }

    @Test
    @DisplayName("deletePermanently deletes physical file and entity")
    void deletePermanently_Success() {
        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));

        fileService.deletePermanently(100L, owner);

        verify(fileStorageService, times(1)).deletePhysicalFile("1/uuid-report.pdf");
        verify(fileRepository, times(1)).delete(sampleFile);
    }

    @Test
    @DisplayName("emptyTrash deletes all physical files and entities in trash")
    void emptyTrash_Success() {
        FileEntity trashedFile = FileEntity.builder()
                .id(105L)
                .name("trash.txt")
                .filePath("1/trash.txt")
                .isTrashed(true)
                .owner(owner)
                .build();

        when(fileRepository.findAllByOwnerAndIsTrashed(owner, true)).thenReturn(List.of(trashedFile));

        fileService.emptyTrash(owner);

        verify(fileStorageService, times(1)).deletePhysicalFile("1/trash.txt");
        verify(fileRepository, times(1)).delete(trashedFile);
        verify(folderRepository, times(1)).deleteAllByOwnerAndIsTrashedTrue(owner);
    }

    @Test
    @DisplayName("shareFile shares file with new user")
    void shareFile_NewShare_Success() {
        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));
        when(fileShareRepository.findByFileAndEmail(sampleFile, "collaborator@test.com")).thenReturn(Optional.empty());
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FileDto.FileShareRequest req = new FileDto.FileShareRequest();
        req.setEmail("collaborator@test.com");
        req.setRole("editor");

        FileDto.FileResponse response = fileService.shareFile(100L, req, owner);

        assertThat(response).isNotNull();
        verify(fileShareRepository, times(1)).save(any(FileShareEntity.class));
    }

    @Test
    @DisplayName("shareFile updates existing share role")
    void shareFile_ExistingShare_UpdatesRole() {
        FileShareEntity existingShare = FileShareEntity.builder()
                .file(sampleFile)
                .email("collaborator@test.com")
                .role("viewer")
                .build();

        when(fileRepository.findByIdAndOwner(100L, owner)).thenReturn(Optional.of(sampleFile));
        when(fileShareRepository.findByFileAndEmail(sampleFile, "collaborator@test.com")).thenReturn(Optional.of(existingShare));
        when(fileRepository.save(any(FileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FileDto.FileShareRequest req = new FileDto.FileShareRequest();
        req.setEmail("collaborator@test.com");
        req.setRole("editor");

        FileDto.FileResponse response = fileService.shareFile(100L, req, owner);

        assertThat(response).isNotNull();
        assertThat(existingShare.getRole()).isEqualTo("editor");
        verify(fileShareRepository, times(1)).save(existingShare);
    }

    @Test
    @DisplayName("getStorageStats calculates accurate storage breakdown by category")
    void getStorageStats_Success() {
        FileEntity fileDoc = FileEntity.builder()
                .id(1L)
                .name("doc.pdf")
                .category("documents")
                .size(5000L)
                .owner(owner)
                .build();

        FileEntity fileImg = FileEntity.builder()
                .id(2L)
                .name("pic.png")
                .category("images")
                .size(10000L)
                .owner(owner)
                .build();

        when(fileRepository.findAllByOwnerAndIsTrashed(owner, false)).thenReturn(List.of(fileDoc, fileImg));

        StorageStatsDto.StorageStatsResponse stats = fileService.getStorageStats(owner);

        assertThat(stats.total()).isEqualTo(100L * 1024L * 1024L * 1024L);
        assertThat(stats.used()).isEqualTo(15000L);

        StorageStatsDto.StorageCategoryStat docStat = stats.categories().stream()
                .filter(c -> "documents".equals(c.category()))
                .findFirst().orElseThrow();
        assertThat(docStat.size()).isEqualTo(5000L);
        assertThat(docStat.fileCount()).isEqualTo(1);

        StorageStatsDto.StorageCategoryStat imgStat = stats.categories().stream()
                .filter(c -> "images".equals(c.category()))
                .findFirst().orElseThrow();
        assertThat(imgStat.size()).isEqualTo(10000L);
        assertThat(imgStat.fileCount()).isEqualTo(1);
    }
}
