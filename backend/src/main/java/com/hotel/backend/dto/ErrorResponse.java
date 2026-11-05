package com.hotel.backend.dto;

import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

public record ErrorResponse(
        int status,
        String error,
        String message,
        LocalDateTime errorTime
) {
    public static ErrorResponse from(Exception exception, HttpStatus status){
        return new ErrorResponse(
                status.value(),
                status.getReasonPhrase(),
                exception.getLocalizedMessage(),
                LocalDateTime.now()
        );
    }
}
