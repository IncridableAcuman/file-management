package com.hotel.backend.dto;

import com.hotel.backend.entity.RoleEntity;
import com.hotel.backend.entity.UserEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {

    @Data
    public static class UpdatePasswordRequest{
        @NotBlank(message = "Password is required")
        @Size(min = 8,message = "Password must be greater than 8 character long")
        private String password;

        @NotBlank(message = "Confirm password is required")
        @Size(min = 8,message = "Confirm password must be greater than 8 character long")
        private String confirmPassword;
    }

    public record UserResponse(
            Long id,
            String username,
            String email,
            RoleEntity role,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ){
        public static UserResponse from(UserEntity user){
            return new UserResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getCreatedAt(),
                    user.getUpdatedAt()
            );
        }
    }
}
