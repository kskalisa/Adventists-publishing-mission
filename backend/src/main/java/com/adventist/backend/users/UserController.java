package com.adventist.backend.users;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    List<UserDto> listUsers() {
        return service.listUsers();
    }

    @GetMapping("/{id}")
    UserDto getUser(@PathVariable Long id) {
        return service.getUser(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    UserDto createUser(@RequestBody CreateUserRequest request) {
        return service.createUser(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
    }
}
