package com.adventist.backend.auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

import com.adventist.backend.notifications.EmailNotificationService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserDto;

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    private final AuthTokenRepository tokenRepository;
    private final AuthChallengeRepository challengeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailNotificationService emailNotificationService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(AppUserRepository userRepository, AuthTokenRepository tokenRepository, AuthChallengeRepository challengeRepository, PasswordEncoder passwordEncoder, EmailNotificationService emailNotificationService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.challengeRepository = challengeRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional
    public AuthResponse login(String email, String password) {
        requireText(email, "email");
        requireText(password, "password");
        AppUser user = userRepository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new IllegalArgumentException("invalid email or password"));
        if (!user.isActive()) {
            throw new IllegalArgumentException("account is inactive");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("invalid email or password");
        }
        challengeRepository.deleteByExpiresAtBefore(Instant.now());
        challengeRepository.deleteByUserId(user.getId());
        String otpCode = createOtp();
        AuthChallenge challenge = challengeRepository.save(new AuthChallenge(user, otpCode, Instant.now().plus(10, ChronoUnit.MINUTES)));
        emailNotificationService.sendOtp(user, otpCode);
        return new AuthResponse(null, null, true, challenge.getChallengeId());
    }

    @Transactional
    public AuthResponse verifyOtp(String challengeId, String otp) {
        requireText(challengeId, "challengeId");
        requireText(otp, "otp");
        tokenRepository.deleteByExpiresAtBefore(Instant.now());
        challengeRepository.deleteByExpiresAtBefore(Instant.now());
        AuthChallenge challenge = challengeRepository.findByChallengeId(challengeId)
                .orElseThrow(() -> new IllegalArgumentException("invalid or expired verification code"));
        if (challenge.getExpiresAt().isBefore(Instant.now()) || !challenge.getOtpCode().equals(otp.trim())) {
            throw new IllegalArgumentException("invalid or expired verification code");
        }
        AppUser user = challenge.getUser();
        if (!user.isActive()) {
            throw new IllegalArgumentException("account is inactive");
        }
        challengeRepository.delete(challenge);
        String token = createToken();
        tokenRepository.save(new AuthToken(token, user, Instant.now().plus(12, ChronoUnit.HOURS)));
        return new AuthResponse(UserDto.from(user), token, false, null);
    }

    @Transactional
    public UserDto changePassword(AppUser user, String currentPassword, String newPassword) {
        requireText(currentPassword, "currentPassword");
        requireText(newPassword, "newPassword");
        if (newPassword.length() < 8) {
            throw new IllegalArgumentException("new password must be at least 8 characters");
        }
        AppUser managedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("user account no longer exists"));
        if (!passwordEncoder.matches(currentPassword, managedUser.getPasswordHash())) {
            throw new IllegalArgumentException("current password is incorrect");
        }
        managedUser.setPasswordHash(passwordEncoder.encode(newPassword));
        managedUser.setPasswordChangeRequired(false);
        return UserDto.from(managedUser);
    }

    @Transactional(readOnly = true)
    public Optional<AppUser> authenticateToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return tokenRepository.findByToken(token)
                .filter(authToken -> authToken.getExpiresAt().isAfter(Instant.now()))
                .map(AuthToken::getUser)
                .filter(AppUser::isActive);
    }

    private String createToken() {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String createOtp() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
