package com.adventist.backend.customers;

import java.time.Instant;

public class CustomerRegistrationDto {
    private final Long id;
    private final String name;
    private final CustomerType type;
    private final String email;
    private final String phone;
    private final String district;
    private final String address;
    private final CustomerRegistrationStatus status;
    private final Instant createdAt;

    public CustomerRegistrationDto(Long id, String name, CustomerType type, String email, String phone, String district, String address, CustomerRegistrationStatus status, Instant createdAt) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.email = email;
        this.phone = phone;
        this.district = district;
        this.address = address;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static CustomerRegistrationDto from(CustomerRegistration r) {
        return new CustomerRegistrationDto(r.getId(), r.getName(), r.getType(), r.getEmail(), r.getPhone(), r.getDistrict(), r.getAddress(), r.getStatus(), r.getCreatedAt());
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public CustomerType getType() { return type; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public String getDistrict() { return district; }
    public String getAddress() { return address; }
    public CustomerRegistrationStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
