package com.adventist.backend.customers;

public record CreateCustomerRegistration(String name, CustomerType type, String email, String phone, String district, String address, String password) {
}
