package com.adventist.backend;

import com.adventist.backend.auth.AuthTokenRepository;
import com.adventist.backend.auth.AuthChallenge;
import com.adventist.backend.auth.AuthChallengeRepository;
import com.adventist.backend.audit.AuditLogRepository;
import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.customers.CustomerType;
import com.adventist.backend.notifications.NotificationRepository;
import com.adventist.backend.production.ProductionOrderRepository;
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
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class DashboardAndSalesSecurityIntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private AuthTokenRepository authTokenRepository;

    @Autowired
    private AuthChallengeRepository authChallengeRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private SaleRepository saleRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ProductionOrderRepository productionOrderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private String adminToken;
    private String inventoryToken;

    @BeforeEach
    void setUp() throws Exception {
        authTokenRepository.deleteAll();
        authChallengeRepository.deleteAll();
        auditLogRepository.deleteAll();
        saleRepository.deleteAll();
        productionOrderRepository.deleteAll();
        notificationRepository.deleteAll();
        customerRepository.deleteAll();
        bookRepository.deleteAll();
        userRepository.deleteAll();

        userRepository.save(new AppUser("Admin User", "admin@test.rw", UserRole.ADMIN, passwordEncoder.encode("admin123")));
        userRepository.save(new AppUser("Inventory User", "inventory@test.rw", UserRole.INVENTORY_MANAGER, passwordEncoder.encode("inventory123")));

        adminToken = obtainToken("admin@test.rw", "admin123");
        inventoryToken = obtainToken("inventory@test.rw", "inventory123");
    }

    @Test
    void testDashboardAccess() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk());
    }

    @Test
    void testCurrentUserAccess() throws Exception {
        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void testSalesAccess() throws Exception {
        mockMvc.perform(get("/api/sales")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk());
    }

    @Test
    void testAuditLogAccess() throws Exception {
        mockMvc.perform(get("/api/audit-logs")
                .header("Authorization", "Bearer " + adminToken))
            .andExpect(status().isOk());
    }

    @Test
    void testFulfillmentStatusUpdatePayload() throws Exception {
        Book book = bookRepository.save(new Book("Fulfillment Book", "Author", "ISBN-FULFILL-1", "Orders", new BigDecimal("10.00"), 20, 5));
        Customer customer = customerRepository.save(new Customer("Fulfillment Customer", CustomerType.INDIVIDUAL, "fulfillment@test", "+250788000099", "Kigali", "Kigali delivery address"));

        String createJson = """
            {
              "customerId": %d,
              "status": "APPROVED",
              "discount": 0,
              "fulfillmentMethod": "DELIVERY",
              "deliveryContact": "Fulfillment Contact",
              "deliveryAddress": "Kigali delivery point",
              "items": [{ "bookId": %d, "quantity": 1 }]
            }
            """.formatted(customer.getId(), book.getId());

        MvcResult createResponse = mockMvc.perform(post("/api/sales")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(status().isCreated())
            .andReturn();

        Long saleId = objectMapper.readTree(createResponse.getResponse().getContentAsString()).get("id").asLong();

        String updateJson = """
            {
              "status": "PROCESSING",
              "paymentMethod": "CASH",
              "amountPaid": 0,
              "fulfillmentMethod": "DELIVERY",
              "deliveryContact": "Fulfillment Contact",
              "deliveryAddress": "Kigali delivery point",
              "internalNote": "Fulfillment board update"
            }
            """;

        mockMvc.perform(put("/api/sales/" + saleId + "/status")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updateJson))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("PROCESSING"))
            .andExpect(jsonPath("$.fulfillmentMethod").value("DELIVERY"))
            .andExpect(jsonPath("$.deliveryAddress").value("Kigali delivery point"));
    }

    @Test
    void inventoryManagerCanCreateProductionRequestButCannotApproveIt() throws Exception {
        Book book = bookRepository.save(new Book("Reprint Needed", "Author", "ISBN-REPRINT-1", "Planning", new BigDecimal("12.00"), 2, 10));

        String createJson = """
            {
              "bookId": %d,
              "quantity": 50,
              "printer": "Coordinator to assign",
              "notes": "Inventory requested reprint review",
              "estimatedCost": 600
            }
            """.formatted(book.getId());

        MvcResult createResponse = mockMvc.perform(post("/api/production-orders")
                .header("Authorization", "Bearer " + inventoryToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.status").value("PLANNED"))
            .andExpect(jsonPath("$.createdByName").value("Inventory User"))
            .andReturn();

        Long orderId = objectMapper.readTree(createResponse.getResponse().getContentAsString()).get("id").asLong();
        String approveJson = """
            {
              "quantity": 50,
              "printer": "Kigali Print Press",
              "estimatedCost": 600,
              "status": "APPROVED"
            }
            """;

        mockMvc.perform(put("/api/production-orders/" + orderId)
                .header("Authorization", "Bearer " + inventoryToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(approveJson))
            .andExpect(status().isForbidden());
    }

    @Test
    void productionOrderRejectsPastExpectedDeliveryDate() throws Exception {
        Book book = bookRepository.save(new Book("Past Delivery Book", "Author", "ISBN-REPRINT-PAST", "Planning", new BigDecimal("12.00"), 2, 10));

        String createJson = """
            {
              "bookId": %d,
              "quantity": 50,
              "printer": "Kigali Print Press",
              "expectedDeliveryDate": "%s",
              "estimatedCost": 600
            }
            """.formatted(book.getId(), LocalDate.now().minusDays(1));

        mockMvc.perform(post("/api/production-orders")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(createJson))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.detail").value("expectedDeliveryDate cannot be in the past"));
    }

    private String obtainToken(String email, String password) throws Exception {
        String loginJson = "{\"email\":\"%s\",\"password\":\"%s\"}".formatted(email, password);
        MvcResult response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode body = objectMapper.readTree(response.getResponse().getContentAsString());
        String challengeId = body.get("challengeId").asText();
        AuthChallenge challenge = authChallengeRepository.findByChallengeId(challengeId).orElseThrow();
        String verifyJson = "{\"challengeId\":\"%s\",\"otp\":\"%s\"}".formatted(challengeId, challenge.getOtpCode());
        MvcResult verifyResponse = mockMvc.perform(post("/api/auth/verify-otp")
                .contentType(MediaType.APPLICATION_JSON)
                .content(verifyJson))
            .andExpect(status().isOk())
            .andReturn();
        return objectMapper.readTree(verifyResponse.getResponse().getContentAsString()).get("token").asText();
    }
}
