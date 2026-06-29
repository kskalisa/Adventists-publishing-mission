package com.adventist.backend.notifications;

import com.adventist.backend.users.AppUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/my")
    List<NotificationDto> listMine(@AuthenticationPrincipal AppUser user) {
        return service.listMine(user);
    }

    @PostMapping("/{id}/read")
    NotificationDto markRead(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.markRead(id, user);
    }
}
