package com.adventist.backend.books;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {
    private final BookService service;

    public BookController(BookService service) {
        this.service = service;
    }

    @GetMapping
    List<BookDto> listBooks(@RequestParam(required = false) String search) {
        return service.listBooks(search);
    }

    @GetMapping("/{id}")
    BookDto getBook(@PathVariable Long id) {
        return service.getBook(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    BookDto createBook(@RequestBody CreateBookRequest request) {
        return service.createBook(request);
    }

    @PutMapping("/{id}")
    BookDto updateBook(@PathVariable Long id, @RequestBody UpdateBookRequest request) {
        return service.updateBook(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteBook(@PathVariable Long id) {
        service.deleteBook(id);
    }
}
