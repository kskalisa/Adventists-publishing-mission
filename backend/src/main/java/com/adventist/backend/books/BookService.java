package com.adventist.backend.books;

import com.adventist.backend.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BookService {
    private final BookRepository repository;

    public BookService(BookRepository repository) {
        this.repository = repository;
    }

    public List<BookDto> listBooks(String search) {
        List<Book> books = search == null || search.isBlank() ? repository.findAll() : repository.search(search.trim());
        return books.stream().map(BookDto::from).toList();
    }

    public BookDto getBook(Long id) {
        return BookDto.from(findBook(id));
    }

    @Transactional
    public BookDto createBook(CreateBookRequest request) {
        requireText(request.title(), "title");
        requireText(request.author(), "author");
        requireText(request.isbn(), "isbn");
        requireText(request.category(), "category");
        if (request.price() == null || request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("price must be zero or greater");
        }
        int stockQuantity = request.stockQuantity() == null ? 0 : request.stockQuantity();
        int reorderLevel = request.reorderLevel() == null ? 10 : request.reorderLevel();
        if (stockQuantity < 0 || reorderLevel < 0) {
            throw new IllegalArgumentException("stock values must be zero or greater");
        }
        if (repository.existsByIsbn(request.isbn())) {
            throw new IllegalArgumentException("isbn is already registered");
        }
        Book book = new Book(request.title().trim(), request.author().trim(), request.isbn().trim(), request.category().trim(), request.price(), stockQuantity, reorderLevel);
        if (request.coverImageUrl() != null && !request.coverImageUrl().isBlank()) {
            book.setCoverImageUrl(request.coverImageUrl());
        }
        return BookDto.from(repository.save(book));
    }

    @Transactional
    public BookDto updateBook(Long id, UpdateBookRequest request) {
        Book book = findBook(id);
        requireText(request.title(), "title");
        requireText(request.author(), "author");
        requireText(request.isbn(), "isbn");
        requireText(request.category(), "category");
        if (request.price() == null || request.price().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("price must be zero or greater");
        }
        int stockQuantity = request.stockQuantity() == null ? 0 : request.stockQuantity();
        int reorderLevel = request.reorderLevel() == null ? 10 : request.reorderLevel();
        if (stockQuantity < 0 || reorderLevel < 0) {
            throw new IllegalArgumentException("stock values must be zero or greater");
        }
        book.setTitle(request.title().trim());
        book.setAuthor(request.author().trim());
        book.setIsbn(request.isbn().trim());
        book.setCategory(request.category().trim());
        book.setPrice(request.price());
        book.setStockQuantity(stockQuantity);
        book.setReorderLevel(reorderLevel);
        book.setCoverImageUrl(request.coverImageUrl());
        return BookDto.from(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = findBook(id);
        repository.delete(book);
    }

    @Transactional
    public Book adjustStock(Long bookId, int quantityDelta) {
        Book book = findBook(bookId);
        int nextQuantity = book.getStockQuantity() + quantityDelta;
        if (nextQuantity < 0) {
            throw new IllegalArgumentException("stock cannot be negative");
        }
        book.setStockQuantity(nextQuantity);
        return book;
    }

    private Book findBook(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("book not found"));
    }

    private void requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
    }
}
