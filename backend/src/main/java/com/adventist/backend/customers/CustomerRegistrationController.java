package com.adventist.backend.customers;

import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-requests")
public class CustomerRegistrationController {
    private final CustomerRegistrationService service;

    public CustomerRegistrationController(CustomerRegistrationService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    CustomerRegistrationDto register(@RequestBody CreateCustomerRegistration request) {
        return service.register(request);
    }

    @GetMapping
    List<CustomerRegistrationDto> list() {
        return service.listRequests();
    }

    @PostMapping("/{id}/approve")
    UserDto approve(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.approve(id, user);
    }

    @PostMapping("/{id}/reject")
    CustomerRegistrationDto reject(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.reject(id, user);
    }
}
