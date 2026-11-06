package com.hotel.backend.service;

import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomInternalServiceErrorException;
import com.hotel.backend.exception.CustomNotFoundException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    private Path rootLocation;

    @PostConstruct
    public void init() {
        try {
            this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.rootLocation);
            log.info("File storage initialized at: {}", this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory", e);
            throw new CustomInternalServiceErrorException("Could not initialize storage directory: " + e.getMessage());
        }
    }

    public record StoredFileInfo(String originalName, String storedName, String relativePath, String extension, String category, long size) {}

    public StoredFileInfo storeFile(MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new CustomBadRequestException("Cannot upload empty file");
        }

        String rawFilename = file.getOriginalFilename();
        if (rawFilename == null || rawFilename.isBlank()) {
            rawFilename = "unnamed_file";
        }
        String originalFilename = StringUtils.cleanPath(rawFilename);

        if (originalFilename.contains("..")) {
            throw new CustomBadRequestException("Filename contains invalid path sequence: " + originalFilename);
        }

        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < originalFilename.length() - 1) {
            extension = originalFilename.substring(dotIndex + 1).toLowerCase();
        }

        String storedName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        String relativePath = userId + "/" + storedName;

        try {
            Path userDir = this.rootLocation.resolve(String.valueOf(userId)).normalize();
            Files.createDirectories(userDir);

            Path destinationPath = userDir.resolve(storedName).normalize();
            if (!destinationPath.startsWith(this.rootLocation)) {
                throw new CustomBadRequestException("Cannot store file outside target directory");
            }

            Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);
            String category = detectCategory(originalFilename, file.getContentType());

            return new StoredFileInfo(originalFilename, storedName, relativePath, extension, category, file.getSize());
        } catch (IOException e) {
            log.error("Failed to store file: {}", originalFilename, e);
            throw new CustomInternalServiceErrorException("Failed to store file: " + e.getMessage());
        }
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            if (!filePath.startsWith(this.rootLocation)) {
                throw new CustomBadRequestException("Access outside storage boundary is forbidden");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new CustomNotFoundException("File not found or unreadable: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new CustomNotFoundException("File path malformed: " + e.getMessage());
        }
    }

    public void deletePhysicalFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            if (filePath.startsWith(this.rootLocation) && Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Physical file deleted: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("Failed to delete physical file: {}", relativePath, e);
        }
    }

    public static String detectCategory(String filename, String mimeType) {
        String ext = "";
        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx > 0 && dotIdx < filename.length() - 1) {
            ext = filename.substring(dotIdx + 1).toLowerCase();
        }

        Set<String> imageExts = new HashSet<>(Arrays.asList("jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico", "tiff"));
        if (imageExts.contains(ext) || (mimeType != null && mimeType.startsWith("image/"))) {
            return "images";
        }

        Set<String> videoExts = new HashSet<>(Arrays.asList("mp4", "mkv", "avi", "mov", "wmv", "flv", "webm", "m4v"));
        if (videoExts.contains(ext) || (mimeType != null && mimeType.startsWith("video/"))) {
            return "videos";
        }

        Set<String> audioExts = new HashSet<>(Arrays.asList("mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"));
        if (audioExts.contains(ext) || (mimeType != null && mimeType.startsWith("audio/"))) {
            return "audio";
        }

        Set<String> archiveExts = new HashSet<>(Arrays.asList("zip", "rar", "7z", "tar", "gz", "bz2", "xz"));
        if (archiveExts.contains(ext)) {
            return "archives";
        }

        Set<String> codeExts = new HashSet<>(Arrays.asList("ts", "tsx", "js", "jsx", "html", "css", "json", "java", "py", "go", "rs", "c", "cpp", "h", "sql", "yaml", "yml", "xml", "sh", "bat"));
        if (codeExts.contains(ext)) {
            return "code";
        }

        Set<String> docExts = new HashSet<>(Arrays.asList("pdf", "doc", "docx", "txt", "md", "rtf", "odt", "ppt", "pptx", "xls", "xlsx", "csv"));
        if (docExts.contains(ext) || (mimeType != null && (mimeType.contains("pdf") || mimeType.contains("word") || mimeType.contains("text") || mimeType.contains("sheet") || mimeType.contains("presentation")))) {
            return "documents";
        }

        return "other";
    }
}
