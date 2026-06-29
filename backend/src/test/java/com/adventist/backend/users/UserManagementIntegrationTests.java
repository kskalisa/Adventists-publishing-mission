package com.adventist.backend.users;

import com.adventist.backend.audit.AuditLogRepository;
import com.adventist.backend.auth.AuthTokenRepository;
import com.adventist.backend.notifications.NotificationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class UserManagementIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private AuthTokenRepository authTokenRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        auditLogRepository.deleteAll();
        authTokenRepository.deleteAll();
        notificationRepository.deleteAll();
        userRepository.deleteAll();
        userRepository.save(new AppUser("Admin User", "admin@test", UserRole.ADMIN, passwordEncoder.encode("admin123")));
        adminToken = obtainAdminToken();
    }

    @Test
    void shouldCreateEditLockUnlockAndDeleteUser() throws Exception {
        String createJson = "{\"name\":\"Sales User\",\"email\":\"sales@test\",\"password\":\"secret123\",\"role\":\"SALES\"}";
        var createResponse = mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.email").value("sales@test"))
            .andReturn();

        long userId = objectMapper.readTree(createResponse.getResponse().getContentAsString()).get("id").asLong();

        String updateJson = "{\"name\":\"Sales Lead\",\"email\":\"saleslead@test\",\"role\":\"SALES\"}";
        mockMvc.perform(put("/api/users/" + userId)
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Sales Lead"))
            .andExpect(jsonPath("$.email").value("saleslead@test"));

        mockMvc.perform(post("/api/users/" + userId + "/lock")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(post("/api/users/" + userId + "/unlock")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.active").value(true));

        mockMvc.perform(delete("/api/users/" + userId)
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isNoContent());

        assertThat(userRepository.findByEmailIgnoreCase("saleslead@test")).isNotPresent();
    }

    @Test
    void shouldPreventSelfLockAndSelfDelete() throws Exception {
        AppUser admin = userRepository.findByEmailIgnoreCase("admin@test").orElseThrow();

        mockMvc.perform(post("/api/users/" + admin.getId() + "/lock")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value("you cannot lock your own account"));

        mockMvc.perform(delete("/api/users/" + admin.getId())
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value("you cannot delete your own account"));
    }

    private String obtainAdminToken() throws Exception {
        String loginJson = "{\"email\":\"admin@test\",\"password\":\"admin123\"}";
        var response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());
        return body.get("token").asText();
    }
}
