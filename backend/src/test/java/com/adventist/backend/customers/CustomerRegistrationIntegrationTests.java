package com.adventist.backend.customers;

import com.adventist.backend.auth.AuthTokenRepository;
import com.adventist.backend.auth.AuthChallenge;
import com.adventist.backend.auth.AuthChallengeRepository;
import com.adventist.backend.audit.AuditLogRepository;
import com.adventist.backend.notifications.NotificationRepository;
import com.adventist.backend.sales.SaleRepository;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserRole;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class CustomerRegistrationIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private CustomerRegistrationRepository registrationRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private AuthTokenRepository authTokenRepository;

    @Autowired
    private AuthChallengeRepository authChallengeRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        saleRepository.deleteAll();
        authTokenRepository.deleteAll();
        authChallengeRepository.deleteAll();
        auditLogRepository.deleteAll();
        notificationRepository.deleteAll();
        registrationRepository.deleteAll();
        customerRepository.deleteAll();
        userRepository.deleteAll();
        userRepository.save(new AppUser("Admin User", "admin@test", UserRole.ADMIN, passwordEncoder.encode("admin123")));
    }

    @Test
    void shouldRegisterCustomerAndApproveRequest() throws Exception {
        String requestJson = "{\"name\":\"Test Customer\",\"email\":\"customer@test\",\"password\":\"secret123\",\"type\":\"INDIVIDUAL\",\"phone\":\"+250788000001\",\"district\":\"Kigali\"}";
        var registrationResponse = mockMvc.perform(post("/api/customer-requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PENDING"))
            .andExpect(jsonPath("$.email").value("customer@test"))
            .andReturn();

        String token = obtainAdminToken();

        var listResponse = mockMvc.perform(get("/api/customer-requests").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status").value("PENDING"))
            .andReturn();

        JsonNode listBody = objectMapper.readTree(listResponse.getResponse().getContentAsString());
        Long requestId = listBody.get(0).get("id").asLong();

        var approveResponse = mockMvc.perform(post("/api/customer-requests/" + requestId + "/approve").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("CUSTOMER"))
            .andReturn();

        assertThat(userRepository.findByEmailIgnoreCase("customer@test")).isPresent();
        assertThat(customerRepository.findAll()).hasSize(1);
        assertThat(registrationRepository.findById(requestId)).isPresent().get().extracting(CustomerRegistration::getStatus).isEqualTo(CustomerRegistrationStatus.APPROVED);
    }

    @Test
    void shouldRejectCustomerRequest() throws Exception {
        String requestJson = "{\"name\":\"Rejected Customer\",\"email\":\"rejected@test\",\"password\":\"secret123\",\"type\":\"INDIVIDUAL\"}";
        mockMvc.perform(post("/api/customer-requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PENDING"));

        String token = obtainAdminToken();

        var listResponse = mockMvc.perform(get("/api/customer-requests").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode listBody = objectMapper.readTree(listResponse.getResponse().getContentAsString());
        Long requestId = listBody.get(0).get("id").asLong();

        mockMvc.perform(post("/api/customer-requests/" + requestId + "/reject").header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("REJECTED"));

        assertThat(userRepository.findByEmailIgnoreCase("rejected@test")).isNotPresent();
        assertThat(registrationRepository.findById(requestId)).isPresent().get().extracting(CustomerRegistration::getStatus).isEqualTo(CustomerRegistrationStatus.REJECTED);
    }

    @Test
    void shouldRejectDuplicateCustomerEmail() throws Exception {
        String token = obtainAdminToken();
        String requestJson = "{\"name\":\"First Customer\",\"email\":\"customer@test\",\"type\":\"INDIVIDUAL\"}";
        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestJson))
            .andExpect(status().isCreated());

        String duplicateJson = "{\"name\":\"Second Customer\",\"email\":\" CUSTOMER@test \",\"type\":\"CHURCH\"}";
        mockMvc.perform(post("/api/customers")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(duplicateJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value("customer email is already registered"));
    }

    private String obtainAdminToken() throws Exception {
        String loginJson = "{\"email\":\"admin@test\",\"password\":\"admin123\"}";
        var response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());
        String challengeId = body.get("challengeId").asText();
        AuthChallenge challenge = authChallengeRepository.findByChallengeId(challengeId).orElseThrow();
        String verifyJson = "{\"challengeId\":\"%s\",\"otp\":\"%s\"}".formatted(challengeId, challenge.getOtpCode());
        var verifyResponse = mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(verifyJson))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode verifiedBody = objectMapper.readTree(verifyResponse.getResponse().getContentAsString());
        return verifiedBody.get("token").asText();
    }
}
