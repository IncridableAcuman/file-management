package com.hotel.backend.service;

import com.hotel.backend.dto.UserDto;
import com.hotel.backend.entity.UserEntity;
import com.hotel.backend.exception.CustomBadRequestException;
import com.hotel.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserDto.UserResponse getUserById(Long id){
        UserEntity user = userRepository.findById(id).orElseThrow();
        return UserDto.UserResponse.from(user);
    }
    public List<UserDto.UserResponse> getUsers(){
        List<UserEntity> users = userRepository.findAll();
        return users
                .stream()
                .map(UserDto.UserResponse::from)
                .toList();
    }
    public void updatePassword(Long id,UserDto.UpdatePasswordRequest request){
        if (!request.getPassword().equals(request.getConfirmPassword())){
            throw new CustomBadRequestException("Password and confirm password mismatch");}
        UserEntity user = userRepository.findById(id).orElseThrow();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }
    public void deleteUser(Long id){
        UserEntity user = userRepository.findById(id).orElseThrow();
        userRepository.delete(user);
    }
}
