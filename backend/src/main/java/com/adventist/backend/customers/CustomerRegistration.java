package com.adventist.backend.customers;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "customer_registrations")
public class CustomerRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerType type;

    private String email;
    private String phone;
    private String district;
    @Column(columnDefinition = "text")
    private String address;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerRegistrationStatus status = CustomerRegistrationStatus.PENDING;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected CustomerRegistration() {}

    public CustomerRegistration(String name, CustomerType type, String email, String phone, String district, String address, String passwordHash) {
        this.name = name;
        this.type = type;
        this.email = email;
        this.phone = phone;
        this.district = district;
        this.address = address;
        this.passwordHash = passwordHash;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public CustomerType getType() { return type; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getDistrict() { return district; }
    public String getAddress() { return address; }
    public String getPasswordHash() { return passwordHash; }
    public CustomerRegistrationStatus getStatus() { return status; }
    public void setStatus(CustomerRegistrationStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
}
