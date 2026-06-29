package com.adventist.backend.auth;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

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
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(AppUserRepository userRepository, AuthTokenRepository tokenRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
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
        tokenRepository.deleteByExpiresAtBefore(Instant.now());
        String token = createToken();
        tokenRepository.save(new AuthToken(token, user, Instant.now().plus(12, ChronoUnit.HOURS)));
        return new AuthResponse(UserDto.from(user), token);
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

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
