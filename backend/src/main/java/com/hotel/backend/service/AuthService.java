package com.hotel.backend.service;

import com.hotel.backend.dto.AuthDto;
import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.TokenEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.entity.enums.RoleType;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.exception.CustomUnauthorizedException;
import com.hotel.backend.repository.UserRepository;
import com.hotel.backend.util.CookieUtil;
import com.hotel.backend.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final RoleService roleService;
    private final CookieUtil cookieUtil;
    private final JwtUtil jwtUtil;

    public UserEntity findUserByEmail(String email){
        return userRepository.findByEmail(email).orElseThrow(()-> new CustomNotFoundException("User not found"));
    }
    public AuthDto.AuthResponse authResponse(UserEntity user,HttpServletResponse response){
        String refreshToken = jwtUtil.generateRefreshToken(user);
        String accessToken = jwtUtil.generateAccessToken(user);
        tokenService.saveToken(user,refreshToken);
        cookieUtil.addCookie(refreshToken,response);
        return AuthDto.AuthResponse.from(accessToken);
    }
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request, HttpServletResponse response){
        if (userRepository.existsByEmail(request.getEmail())){
            throw new CustomBadRequestException("User already exists");
        }
        UserEntity user = UserEntity
                .builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();
        userRepository.save(user);

        RoleEntity role = roleService.createRole(user, RoleType.USER);
        user.setRole(role);
        UserEntity saved = userRepository.save(user);
        return authResponse(saved,response);
    }
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request,HttpServletResponse response){
        UserEntity user = findUserByEmail(request.getEmail());
        if (!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new CustomBadRequestException("Password mismatch");
        }
        return authResponse(user,response);
    }
    public UserEntity checkingAndValidatingToken(String refreshToken){
        if (refreshToken == null || refreshToken.isEmpty()){
            throw new CustomBadRequestException("Refresh token is null or empty");
        }
        if (!jwtUtil.validateToken(refreshToken)){
            throw new CustomUnauthorizedException("Invalid or expired refresh token");
        }
        Date expiration = jwtUtil.getExpiration(refreshToken);
        String email = jwtUtil.getSubject(refreshToken);
        UserEntity user = findUserByEmail(email);
        TokenEntity dbToken = tokenService.getTokenFromDb(user);
        LocalDateTime expirationLdt = expiration.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
        if (!expirationLdt.equals(dbToken.getExpiration())){
            throw new CustomUnauthorizedException("Refresh token expiration mismatch detected.");
        }
        return user;
    }
    public AuthDto.AuthResponse refresh(String refreshToken,HttpServletResponse response){
        UserEntity user = checkingAndValidatingToken(refreshToken);
        return authResponse(user,response);
    }
    public void logout(String refreshToken,HttpServletResponse response){
        UserEntity user = checkingAndValidatingToken(refreshToken);
        tokenService.deleteToken(user);
        cookieUtil.clearCookie(response);
    }
}
