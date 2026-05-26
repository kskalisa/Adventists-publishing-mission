package com.adventist.backend.customers;

import java.time.Instant;

public record CustomerDto(Long id, String name, CustomerType type, String email, String phone, String district, boolean active, Instant createdAt) {
    public static CustomerDto from(Customer customer) {
        return new CustomerDto(customer.getId(), customer.getName(), customer.getType(), customer.getEmail(), customer.getPhone(), customer.getDistrict(), customer.isActive(), customer.getCreatedAt());
    }
}
