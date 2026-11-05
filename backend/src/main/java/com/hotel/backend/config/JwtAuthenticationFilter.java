package com.hotel.backend.config;

import com.hotel.backend.service.LoadUserDetailsService;
import com.hotel.backend.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final LoadUserDetailsService loadUserDetailsService;


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
        }
        String token = header.substring(7);
        try {
            String type = jwtUtil.getTokenType(token);
            if (!JwtUtil.ACCESS.equals(type)){
                filterChain.doFilter(request,response);
                return;
            }
            if (jwtUtil.validateToken(token)){
                String email = jwtUtil.getSubject(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null){
                    UserDetails userDetails = loadUserDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }

        } catch (Exception exception){
            SecurityContextHolder.clearContext();
        }
        filterChain.doFilter(request,response);
    }
}
