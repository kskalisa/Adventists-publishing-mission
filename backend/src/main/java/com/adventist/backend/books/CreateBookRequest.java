package com.adventist.backend.books;

import java.math.BigDecimal;

public record CreateBookRequest(
        String title,
        String author,
        String isbn,
        String category,
        BigDecimal price,
        Integer stockQuantity,
        Integer reorderLevel
) {
}
