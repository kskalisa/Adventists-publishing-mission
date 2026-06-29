package com.adventist.backend.users;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    UserDto createUser(@RequestBody CreateUserRequest request, @AuthenticationPrincipal AppUser user) {
        return service.createUser(request, user);
    }

    @PutMapping("/{id}")
    UserDto updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request, @AuthenticationPrincipal AppUser user) {
        return service.updateUser(id, request, user);
    }

    @PostMapping("/{id}/lock")
    UserDto lockUser(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.setActive(id, false, user);
    }

    @PostMapping("/{id}/unlock")
    UserDto unlockUser(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.setActive(id, true, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteUser(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        service.deleteUser(id, user);
    }
}
