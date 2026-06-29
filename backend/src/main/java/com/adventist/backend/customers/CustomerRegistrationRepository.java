package com.adventist.backend.customers;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRegistrationRepository extends JpaRepository<CustomerRegistration, Long> {
    boolean existsByEmailIgnoreCaseAndStatus(String email, CustomerRegistrationStatus status);
}
