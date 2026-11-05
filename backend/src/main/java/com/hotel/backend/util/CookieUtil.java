package com.hotel.backend.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
    @Value("${jwt.refresh_time}")
    private long refreshTime;
    @Value("${cookie.secure}")
    private boolean secure;

    private void cookieManaging(String refreshToken,long expiration, HttpServletResponse response){
        ResponseCookie cookie = ResponseCookie
                .from("refreshToken",refreshToken)
                .httpOnly(true)
                .value(refreshToken)
                .maxAge(expiration)
                .sameSite("Lax")
                .secure(secure)
                .path("/")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE,cookie.toString());
    }
    public void addCookie(String refreshToken,HttpServletResponse response){
        cookieManaging(refreshToken,refreshTime/1000,response);
    }
    public void clearCookie(HttpServletResponse response){
        cookieManaging("",0,response);
    }
}
