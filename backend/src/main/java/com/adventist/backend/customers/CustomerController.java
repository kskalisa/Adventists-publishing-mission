package com.adventist.backend.customers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @GetMapping
    List<CustomerDto> listCustomers(@RequestParam(required = false) String search) {
        return service.listCustomers(search);
    }

    @GetMapping("/{id}")
    CustomerDto getCustomer(@PathVariable Long id) {
        return service.getCustomer(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    CustomerDto createCustomer(@RequestBody CreateCustomerRequest request) {
        return service.createCustomer(request);
    }
}
