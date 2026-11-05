package com.hotel.backend.service;

import com.hotel.backend.entity.TokenEntity;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomNotFoundException;
import com.hotel.backend.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final TokenRepository tokenRepository;

    @Transactional
    public void saveToken(UserEntity user,String refreshToken){
        TokenEntity token = tokenRepository.findByUser(user).orElseGet(TokenEntity::new);
        token.setUser(user);
        token.setRefreshToken(refreshToken);
        token.setExpiration(LocalDateTime.now().plusDays(7));
        tokenRepository.save(token);
    }
    public TokenEntity getTokenFromDb(UserEntity user){
        return tokenRepository.findByUser(user).orElseThrow(()-> new CustomNotFoundException("Token not found"));
    }
    public void deleteToken(UserEntity user){
        TokenEntity token = getTokenFromDb(user);
        tokenRepository.delete(token);
    }
}
