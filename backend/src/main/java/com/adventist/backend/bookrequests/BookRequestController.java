package com.adventist.backend.bookrequests;

import com.adventist.backend.users.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/book-requests")
public class BookRequestController {
    private final BookRequestService service;

    public BookRequestController(BookRequestService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    BookRequestDto create(@RequestBody CreateBookRequestInterest request, @AuthenticationPrincipal AppUser user) {
        return service.create(request, user);
    }

    @GetMapping("/my")
    List<BookRequestDto> listMine(@AuthenticationPrincipal AppUser user) {
        return service.listMine(user);
    }

    @GetMapping
    List<BookRequestDto> listAll() {
        return service.listAll();
    }

    @GetMapping("/summary")
    List<BookRequestSummaryDto> summarizeOpenRequests() {
        return service.summarizeOpenRequests();
    }

    @PutMapping("/{id}/status")
    BookRequestDto updateStatus(@PathVariable Long id, @RequestBody UpdateBookRequestStatus request) {
        return service.updateStatus(id, request);
    }
}
