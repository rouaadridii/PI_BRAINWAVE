package com.example.claimmanagementpi.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConfig {

    private static final Dotenv dotenv = Dotenv.load(); // Load .env file

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(dotenv.get("EMAIL_HOST"));
        mailSender.setPort(Integer.parseInt(dotenv.get("EMAIL_PORT")));
        mailSender.setUsername(dotenv.get("EMAIL_USERNAME"));
        mailSender.setPassword(dotenv.get("EMAIL_PASSWORD"));

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com"); // Using the more secure specific hostname
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");

        return mailSender;
    }
}
