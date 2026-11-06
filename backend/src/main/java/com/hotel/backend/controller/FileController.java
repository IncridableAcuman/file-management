package com.hotel.backend.controller;

import com.hotel.backend.dto.FileDto;
import com.hotel.backend.dto.StorageStatsDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @GetMapping
    public ResponseEntity<List<FileDto.FileResponse>> getFiles(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) Boolean trashed,
            @RequestParam(required = false) Boolean favorite,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.getFiles(currentUser, category, folderId, trashed, favorite, search));
    }

    @GetMapping("/shared")
    public ResponseEntity<List<FileDto.FileResponse>> getSharedFiles(
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.getSharedFiles(currentUser));
    }

    @GetMapping("/storage-stats")
    public ResponseEntity<StorageStatsDto.StorageStatsResponse> getStorageStats(
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.getStorageStats(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileDto.FileResponse> getFileById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.getFileById(id, currentUser));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<FileDto.FileResponse>> uploadFiles(
            @RequestParam(value = "files", required = false) MultipartFile[] files,
            @RequestParam(value = "file", required = false) MultipartFile singleFile,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        List<MultipartFile> fileList;
        if (files != null && files.length > 0) {
            fileList = Arrays.asList(files);
        } else if (singleFile != null) {
            fileList = List.of(singleFile);
        } else {
            return ResponseEntity.badRequest().build();
        }

        List<FileDto.FileResponse> responses = fileService.uploadFiles(fileList, folderId, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(responses);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        FileService.FileResourcePayload payload = fileService.getFileResource(id, currentUser);
        String filename = payload.file().getName();
        String encodedFilename = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");

        String mimeType = payload.file().getMimeType();
        if (mimeType == null || mimeType.isBlank()) {
            mimeType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + encodedFilename + "\"; filename*=UTF-8''" + encodedFilename)
                .body(payload.resource());
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewFile(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        FileService.FileResourcePayload payload = fileService.getFileResource(id, currentUser);

        String mimeType = payload.file().getMimeType();
        if (mimeType == null || mimeType.isBlank()) {
            mimeType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(payload.resource());
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<FileDto.FileResponse> renameFile(
            @PathVariable Long id,
            @Valid @RequestBody FileDto.FileRenameRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.renameFile(id, request.getName(), currentUser));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<FileDto.FileResponse> toggleFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.toggleFavorite(id, currentUser));
    }

    @PatchMapping("/{id}/trash")
    public ResponseEntity<String> moveToTrash(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        fileService.moveToTrash(id, currentUser);
        return ResponseEntity.ok("File moved to trash");
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<String> restoreFromTrash(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        fileService.restoreFromTrash(id, currentUser);
        return ResponseEntity.ok("File restored from trash");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePermanently(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        fileService.deletePermanently(id, currentUser);
        return ResponseEntity.ok("File permanently deleted");
    }

    @DeleteMapping("/trash/empty")
    public ResponseEntity<String> emptyTrash(
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        fileService.emptyTrash(currentUser);
        return ResponseEntity.ok("Trash emptied successfully");
    }

    @PostMapping("/{id}/share")
    public ResponseEntity<FileDto.FileResponse> shareFile(
            @PathVariable Long id,
            @Valid @RequestBody FileDto.FileShareRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(fileService.shareFile(id, request, currentUser));
    }
}
