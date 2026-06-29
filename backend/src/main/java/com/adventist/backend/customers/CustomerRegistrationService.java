package com.adventist.backend.customers;

import com.adventist.backend.audit.AuditService;
import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserDto;
import com.adventist.backend.users.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerRegistrationService {
    private final CustomerRegistrationRepository registrationRepository;
    private final AppUserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public CustomerRegistrationService(CustomerRegistrationRepository registrationRepository, AppUserRepository userRepository, CustomerRepository customerRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public CustomerRegistrationDto register(CreateCustomerRegistration request) {
        requireText(request.name(), "name");
        requireText(request.email(), "email");
        requireText(request.password(), "password");
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("email is already registered");
        }
        if (registrationRepository.existsByEmailIgnoreCaseAndStatus(request.email(), CustomerRegistrationStatus.PENDING)) {
            throw new IllegalArgumentException("a registration for this email is already pending");
        }
        CustomerRegistration reg = new CustomerRegistration(
                request.name().trim(),
                request.type() == null ? CustomerType.INDIVIDUAL : request.type(),
                request.email().trim().toLowerCase(),
                clean(request.phone()),
                clean(request.district()),
                clean(request.address()),
                passwordEncoder.encode(request.password())
        );
        return CustomerRegistrationDto.from(registrationRepository.save(reg));
    }

    @Transactional(readOnly = true)
    public List<CustomerRegistrationDto> listRequests() {
        return registrationRepository.findAll().stream().map(CustomerRegistrationDto::from).toList();
    }

    @Transactional
    public UserDto approve(Long id, AppUser actor) {
        CustomerRegistration reg = findPending(id);
        if (userRepository.existsByEmailIgnoreCase(reg.getEmail())) {
            throw new IllegalArgumentException("email is already registered");
        }
        // create Customer record
        com.adventist.backend.customers.Customer customer = new com.adventist.backend.customers.Customer(reg.getName(), reg.getType(), reg.getEmail(), reg.getPhone(), reg.getDistrict(), reg.getAddress());
        customerRepository.save(customer);
        // create AppUser with CUSTOMER role and the password hash from registration
        AppUser user = new AppUser(reg.getName(), reg.getEmail(), UserRole.CUSTOMER, reg.getPasswordHash());
        reg.setStatus(CustomerRegistrationStatus.APPROVED);
        userRepository.save(user);
        auditService.record(actor, "CUSTOMER_REGISTRATION_APPROVED", "CUSTOMER_REGISTRATION", reg.getId(), "Approved customer registration for " + reg.getEmail());
        return UserDto.from(user);
    }

    @Transactional
    public CustomerRegistrationDto reject(Long id, AppUser actor) {
        CustomerRegistration reg = findPending(id);
        reg.setStatus(CustomerRegistrationStatus.REJECTED);
        auditService.record(actor, "CUSTOMER_REGISTRATION_REJECTED", "CUSTOMER_REGISTRATION", reg.getId(), "Rejected customer registration for " + reg.getEmail());
        return CustomerRegistrationDto.from(reg);
    }

    private CustomerRegistration findPending(Long id) {
        CustomerRegistration reg = registrationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("registration not found"));
        if (reg.getStatus() != CustomerRegistrationStatus.PENDING) {
            throw new IllegalArgumentException("registration is already resolved");
        }
        return reg;
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
