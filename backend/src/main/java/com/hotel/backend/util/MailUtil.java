package com.hotel.backend.util;

import com.hotel.backend.config.RabbitMqConfig;
import com.hotel.backend.dto.EmailPayload;
import com.hotel.backend.exception.CustomInternalServiceErrorException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MailUtil {
    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMqConfig.QUEUE_NAME)
    public void sendMail(EmailPayload payload){
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message);
            helper.setTo(payload.to());
            helper.setSubject(payload.subject());
            helper.setText(payload.text(),true);

            mailSender.send(message);
        } catch (MailException | MessagingException e){
            throw new CustomInternalServiceErrorException(e.getMessage());
        }
    }
}
