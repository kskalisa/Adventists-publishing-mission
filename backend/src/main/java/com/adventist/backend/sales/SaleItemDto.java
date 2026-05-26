package com.adventist.backend.sales;

import java.math.BigDecimal;

public record SaleItemDto(Long id, Long bookId, String title, int quantity, BigDecimal unitPrice, BigDecimal lineTotal) {
    public static SaleItemDto from(SaleItem item) {
        return new SaleItemDto(item.getId(), item.getBook().getId(), item.getBook().getTitle(), item.getQuantity(), item.getUnitPrice(), item.getLineTotal());
    }
}
