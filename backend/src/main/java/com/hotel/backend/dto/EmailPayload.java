package com.hotel.backend.dto;

public record EmailPayload(
        String to,
        String subject,
        String text
) {
}
