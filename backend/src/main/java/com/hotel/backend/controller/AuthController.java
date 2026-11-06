package com.hotel.backend.controller;

import com.hotel.backend.dto.AuthDto;
import com.hotel.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody AuthDto.RegisterRequest request){
        authService.register(request);
        return ResponseEntity.ok("Check your email");
    }
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOtp(@Valid @RequestBody AuthDto.ResendOtpRequest request){
        authService.resendOtpCode(request);
        return ResponseEntity.ok("")
    }
    @PostMapping("/verify-email")
    public ResponseEntity<AuthDto.AuthResponse> verifyEmail(@Valid @RequestBody AuthDto.VerifyEmailRequest request,HttpServletResponse response){
        return ResponseEntity.ok(authService.verifyEmail(request,response));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@Valid @RequestBody AuthDto.LoginRequest request,HttpServletResponse response){
        return ResponseEntity.ok(authService.login(request, response));
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthDto.AuthResponse> refresh(@CookieValue(name = "refreshToken",required = false) String refreshToken,HttpServletResponse response){
        return ResponseEntity.ok(authService.refresh(refreshToken, response));
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = "refreshToken",required = false) String refreshToken,HttpServletResponse response){
        authService.logout(refreshToken, response);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody AuthDto.ForgotPasswordRequest request){
        authService.forgotPassword(request);
        return ResponseEntity.ok("Reset password link sent to email");
    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody AuthDto.ResetPasswordRequest request){
        authService.resetPassword(request);
        return ResponseEntity.ok("Password updated");
    }
}
