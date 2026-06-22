package com.adventist.backend.access;

import com.adventist.backend.users.UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {
    private final AccessRequestService service;

    public AccessRequestController(AccessRequestService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    AccessRequestDto requestAccess(@RequestBody CreateAccessRequest request) {
        return service.requestAccess(request);
    }

    @GetMapping
    List<AccessRequestDto> listRequests() {
        return service.listRequests();
    }

    @PostMapping("/{id}/approve")
    UserDto approve(@PathVariable Long id) {
        return service.approve(id);
    }

    @PostMapping("/{id}/reject")
    AccessRequestDto reject(@PathVariable Long id) {
        return service.reject(id);
    }
}
