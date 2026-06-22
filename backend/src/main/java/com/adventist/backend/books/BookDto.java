package com.adventist.backend.books;

import java.math.BigDecimal;
import java.time.Instant;

public record BookDto(
        Long id,
        String title,
        String author,
        String isbn,
        String category,
        BigDecimal price,
        int stockQuantity,
        int reorderLevel,
        String coverImageUrl,
        BookStatus status,
        Instant createdAt
) {
    public static BookDto from(Book book) {
        return new BookDto(
                book.getId(),
                book.getTitle(),
                book.getAuthor(),
                book.getIsbn(),
                book.getCategory(),
                book.getPrice(),
                book.getStockQuantity(),
                book.getReorderLevel(),
                book.getCoverImageUrl(),
                book.getStatus(),
                book.getCreatedAt()
        );
    }
}
