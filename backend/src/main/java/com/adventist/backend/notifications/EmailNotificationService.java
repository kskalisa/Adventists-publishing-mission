package com.adventist.backend.notifications;

import com.adventist.backend.users.AppUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final NotificationService notificationService;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;
    private final boolean mailEnabled;
    private final String fromAddress;
    private final String fromName;

    public EmailNotificationService(
            NotificationService notificationService,
            ObjectProvider<JavaMailSender> mailSenderProvider,
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${app.mail.from:no-reply@localhost}") String fromAddress,
            @Value("${app.mail.from-name:Adventist Publishing}") String fromName) {
        this.notificationService = notificationService;
        this.mailSenderProvider = mailSenderProvider;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
        this.fromName = fromName;
    }

    public void sendCredentials(AppUser user, String temporaryPassword) {
        String message = "Your account has been created. Email: " + user.getEmail()
                + ". Temporary password: " + temporaryPassword
                + ". You will be asked to change this password after your first login.";
        notificationService.create(user, "Account created", message);
        log.info("TEMPORARY CREDENTIALS for {}: email={}, temporaryPassword={}", user.getName(), user.getEmail(), temporaryPassword);
        send(user.getEmail(), "Account created", message);
    }

    public void sendOtp(AppUser user, String otpCode) {
        String message = "Your login verification code is " + otpCode + ". It expires in 10 minutes.";
        notificationService.create(user, "Login verification code", message);
        log.info("LOGIN OTP for {} <{}>: {}", user.getName(), user.getEmail(), otpCode);
        send(user.getEmail(), "Login verification code", message);
    }

    private void send(String to, String subject, String message) {
        if (!mailEnabled) {
            log.info("Email disabled. Message to {} - {} - {}", to, subject, message);
            return;
        }
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.warn("Email is enabled, but no JavaMailSender is configured. Message to {} - {} - {}", to, subject, message);
            return;
        }
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(fromName + " <" + fromAddress + ">");
            email.setTo(to);
            email.setSubject(subject);
            email.setText(message);
            mailSender.send(email);
        } catch (RuntimeException exception) {
            log.warn("Unable to send email to {}. Message was: {}", to, message, exception);
        }
    }
}
