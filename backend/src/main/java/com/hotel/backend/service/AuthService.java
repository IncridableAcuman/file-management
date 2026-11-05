package com.hotel.backend.service;

import com.hotel.backend.repository.UserRepository;
import com.hotel.backend.util.CookieUtil;
import com.hotel.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final RoleService roleService;
    private final CookieUtil cookieUtil;
    private final JwtUtil jwtUtil;
}
