package com.hotel.backend.exception;

public class CustomInternalServiceErrorException extends RuntimeException{
    public CustomInternalServiceErrorException(String message){
        super(message);
    }
}
