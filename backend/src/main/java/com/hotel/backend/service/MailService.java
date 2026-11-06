package com.hotel.backend.service;

import com.hotel.backend.config.RabbitMqConfig;
import com.hotel.backend.dto.EmailPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MailService {
    private final RabbitTemplate template;

    public void sendMail(EmailPayload payload){
        template
                .convertAndSend(
                        RabbitMqConfig.EXCHANGE_NAME,
                        RabbitMqConfig.ROUTING_KEY,
                        payload
                );
    }
}
