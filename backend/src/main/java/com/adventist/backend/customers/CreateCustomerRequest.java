package com.adventist.backend.customers;

public record CreateCustomerRequest(String name, CustomerType type, String email, String phone, String district) {
}
