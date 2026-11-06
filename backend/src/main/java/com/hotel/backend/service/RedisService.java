package com.hotel.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String,Object> template;

    public String getKey(String email){
        return "otp:" + email;
    }

    public void saveOtp(String email,String otp){
        String key = getKey(email);
        template
                .opsForValue().set(
                        key,
                        otp,
                        10,
                        TimeUnit.MINUTES
                );
    }
    public String getOtp(String email){
        String key = getKey(email);
        Object otp = template.opsForValue().get(key);
        return otp != null ? otp.toString() : "otp not found";
    }
    public void deleteOtp(String email){
        String key = getKey(email);
        template
                .delete(key);
    }
}
