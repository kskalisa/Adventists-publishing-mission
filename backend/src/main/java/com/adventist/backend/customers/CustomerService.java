package com.adventist.backend.customers;

import com.adventist.backend.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {
    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<CustomerDto> listCustomers(String search) {
        List<Customer> customers = search == null || search.isBlank() ? repository.findAll() : repository.search(search.trim());
        return customers.stream().map(CustomerDto::from).toList();
    }

    public CustomerDto getCustomer(Long id) {
        return CustomerDto.from(repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("customer not found")));
    }

    @Transactional
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("name is required");
        }
        CustomerType type = request.type() == null ? CustomerType.INDIVIDUAL : request.type();
        Customer customer = new Customer(request.name().trim(), type, request.email(), request.phone(), request.district());
        return CustomerDto.from(repository.save(customer));
    }
}
