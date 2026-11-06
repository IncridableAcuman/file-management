package com.hotel.backend.controller;

import com.hotel.backend.dto.FolderDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.service.FolderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderService folderService;

    @GetMapping
    public ResponseEntity<List<FolderDto.FolderResponse>> getFolders(
            @RequestParam(required = false) Boolean trashed,
            @RequestParam(required = false) Boolean favorite,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(folderService.getFolders(currentUser, trashed, favorite));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FolderDto.FolderResponse> getFolderById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(folderService.getFolderById(id, currentUser));
    }

    @PostMapping
    public ResponseEntity<FolderDto.FolderResponse> createFolder(
            @Valid @RequestBody FolderDto.FolderCreateRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(folderService.createFolder(request, currentUser));
    }

    @PatchMapping("/{id}/rename")
    public ResponseEntity<FolderDto.FolderResponse> renameFolder(
            @PathVariable Long id,
            @Valid @RequestBody FolderDto.FolderRenameRequest request,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(folderService.renameFolder(id, request.getName(), currentUser));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<FolderDto.FolderResponse> toggleFavorite(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        return ResponseEntity.ok(folderService.toggleFavorite(id, currentUser));
    }

    @PatchMapping("/{id}/trash")
    public ResponseEntity<String> moveToTrash(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        folderService.moveToTrash(id, currentUser);
        return ResponseEntity.ok("Folder moved to trash");
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<String> restoreFromTrash(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        folderService.restoreFromTrash(id, currentUser);
        return ResponseEntity.ok("Folder restored from trash");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePermanently(
            @PathVariable Long id,
            @AuthenticationPrincipal UserEntity currentUser
    ) {
        folderService.deletePermanently(id, currentUser);
        return ResponseEntity.ok("Folder permanently deleted");
    }
}
