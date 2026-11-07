package com.hotel.backend.controller;

import com.hotel.backend.dto.UserDto;
import com.hotel.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto.UserResponse> getCurrentUser(@org.springframework.security.core.annotation.AuthenticationPrincipal com.hotel.backend.entity.UserEntity user){
        return ResponseEntity.ok(userService.getCurrentUser(user));
    }

    @GetMapping
    public ResponseEntity<List<UserDto.UserResponse>> getUsers(){
        return ResponseEntity.ok(userService.getUsers());
    }
    @GetMapping("/{id}")
    public ResponseEntity<UserDto.UserResponse> getUserById(@PathVariable Long id){
        return ResponseEntity.ok(userService.getUserById(id));
    }
    @PostMapping("/{id}")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @Valid @RequestBody UserDto.UpdatePasswordRequest request){
        userService.updatePassword(id, request);
        return ResponseEntity.ok("Password updated");
    }
}
