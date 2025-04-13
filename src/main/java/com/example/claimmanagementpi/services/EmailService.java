package com.example.claimmanagementpi.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.AllArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender; // Auto-injected from MailConfig

    public void sendEmail(String to, String subject, String text) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("wassimbaaziz.officiel@gmail.com"); // Sender Email
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, true); // Enables HTML formatting

            mailSender.send(message);
            System.out.println("📩 Email Sent Successfully to: " + to);
        } catch (MessagingException e) {
            throw new RuntimeException("❌ Failed to send email", e);
        }
    }
}
