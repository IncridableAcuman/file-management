package com.hotel.backend.service;

import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FileStorageServiceTest {

    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService();
        ReflectionTestUtils.setField(fileStorageService, "uploadDir", tempDir.toString());
        fileStorageService.init();
    }

    @Test
    @DisplayName("detectCategory properly categorizes extensions and mime types")
    void detectCategory_VariousTypes() {
        // Images
        assertThat(FileStorageService.detectCategory("photo.png", "image/png")).isEqualTo("images");
        assertThat(FileStorageService.detectCategory("picture.JPEG", null)).isEqualTo("images");
        assertThat(FileStorageService.detectCategory("vector.svg", null)).isEqualTo("images");
        assertThat(FileStorageService.detectCategory("unknown", "image/webp")).isEqualTo("images");

        // Videos
        assertThat(FileStorageService.detectCategory("clip.mp4", "video/mp4")).isEqualTo("videos");
        assertThat(FileStorageService.detectCategory("movie.mkv", null)).isEqualTo("videos");

        // Audio
        assertThat(FileStorageService.detectCategory("song.mp3", "audio/mpeg")).isEqualTo("audio");
        assertThat(FileStorageService.detectCategory("voice.wav", null)).isEqualTo("audio");

        // Archives
        assertThat(FileStorageService.detectCategory("archive.zip", null)).isEqualTo("archives");
        assertThat(FileStorageService.detectCategory("backup.tar.gz", null)).isEqualTo("archives");
        assertThat(FileStorageService.detectCategory("package.7z", null)).isEqualTo("archives");

        // Code
        assertThat(FileStorageService.detectCategory("app.ts", null)).isEqualTo("code");
        assertThat(FileStorageService.detectCategory("script.py", null)).isEqualTo("code");
        assertThat(FileStorageService.detectCategory("index.html", null)).isEqualTo("code");
        assertThat(FileStorageService.detectCategory("Main.java", null)).isEqualTo("code");

        // Documents
        assertThat(FileStorageService.detectCategory("document.pdf", "application/pdf")).isEqualTo("documents");
        assertThat(FileStorageService.detectCategory("sheet.xlsx", null)).isEqualTo("documents");
        assertThat(FileStorageService.detectCategory("notes.txt", "text/plain")).isEqualTo("documents");

        // Other
        assertThat(FileStorageService.detectCategory("unknown.xyz123", "application/octet-stream")).isEqualTo("other");
        assertThat(FileStorageService.detectCategory("noextension", null)).isEqualTo("other");
    }

    @Test
    @DisplayName("storeFile should throw CustomBadRequestException for empty file")
    void storeFile_EmptyFile_ThrowsException() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "test.txt", "text/plain", new byte[0]);

        assertThatThrownBy(() -> fileStorageService.storeFile(emptyFile, 1L))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Cannot upload empty file");
    }

    @Test
    @DisplayName("storeFile should throw CustomBadRequestException when filename contains path traversal")
    void storeFile_PathTraversal_ThrowsException() {
        MockMultipartFile badFile = new MockMultipartFile(
                "file",
                "../test.txt",
                "text/plain",
                "content".getBytes()
        );

        assertThatThrownBy(() -> fileStorageService.storeFile(badFile, 1L))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Filename contains invalid path sequence");
    }

    @Test
    @DisplayName("storeFile should store file successfully and return StoredFileInfo")
    void storeFile_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "sample.pdf",
                "application/pdf",
                "Sample PDF Content".getBytes()
        );

        FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file, 42L);

        assertThat(info).isNotNull();
        assertThat(info.originalName()).isEqualTo("sample.pdf");
        assertThat(info.extension()).isEqualTo("pdf");
        assertThat(info.category()).isEqualTo("documents");
        assertThat(info.size()).isEqualTo("Sample PDF Content".getBytes().length);
        assertThat(info.relativePath()).startsWith("42/");

        Path storedPath = tempDir.resolve(info.relativePath());
        assertThat(Files.exists(storedPath)).isTrue();
        assertThat(Files.readAllBytes(storedPath)).isEqualTo("Sample PDF Content".getBytes());
    }

    @Test
    @DisplayName("storeFile handles empty original filename by defaulting to unnamed_file")
    void storeFile_UnnamedFile_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "",
                "text/plain",
                "data".getBytes()
        );

        FileStorageService.StoredFileInfo info = fileStorageService.storeFile(file, 10L);

        assertThat(info.originalName()).isEqualTo("unnamed_file");
        assertThat(info.extension()).isEqualTo("");
        assertThat(info.relativePath()).startsWith("10/");
    }

    @Test
    @DisplayName("loadFileAsResource successfully loads existing file")
    void loadFileAsResource_Success() throws IOException {
        Path userDir = tempDir.resolve("1");
        Files.createDirectories(userDir);
        Path testFile = userDir.resolve("doc.txt");
        Files.writeString(testFile, "Hello World");

        Resource resource = fileStorageService.loadFileAsResource("1/doc.txt");

        assertThat(resource).isNotNull();
        assertThat(resource.exists()).isTrue();
        assertThat(resource.isReadable()).isTrue();
    }

    @Test
    @DisplayName("loadFileAsResource throws CustomNotFoundException for non-existent file")
    void loadFileAsResource_NotFound_ThrowsException() {
        assertThatThrownBy(() -> fileStorageService.loadFileAsResource("1/nonexistent.txt"))
                .isInstanceOf(CustomNotFoundException.class)
                .hasMessageContaining("File not found or unreadable");
    }

    @Test
    @DisplayName("loadFileAsResource throws CustomBadRequestException when path tries to escape root")
    void loadFileAsResource_OutsideBoundary_ThrowsException() {
        assertThatThrownBy(() -> fileStorageService.loadFileAsResource("../../etc/passwd"))
                .isInstanceOf(CustomBadRequestException.class)
                .hasMessageContaining("Access outside storage boundary is forbidden");
    }

    @Test
    @DisplayName("deletePhysicalFile successfully deletes file and ignores non-existent or blank paths")
    void deletePhysicalFile_Success() throws IOException {
        Path userDir = tempDir.resolve("2");
        Files.createDirectories(userDir);
        Path testFile = userDir.resolve("to_delete.txt");
        Files.writeString(testFile, "Delete Me");

        assertThat(Files.exists(testFile)).isTrue();

        fileStorageService.deletePhysicalFile("2/to_delete.txt");
        assertThat(Files.exists(testFile)).isFalse();

        // Should not throw on null, blank or non-existent
        fileStorageService.deletePhysicalFile(null);
        fileStorageService.deletePhysicalFile("   ");
        fileStorageService.deletePhysicalFile("2/nonexistent.txt");
    }
}
