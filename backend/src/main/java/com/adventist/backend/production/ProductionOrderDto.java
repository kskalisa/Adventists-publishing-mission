package com.adventist.backend.production;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record ProductionOrderDto(
        Long id,
        Long bookId,
        String bookTitle,
        Long createdById,
        String createdByName,
        int quantity,
        String printer,
        LocalDate expectedDeliveryDate,
        String notes,
        ProductionOrderStatus status,
        BigDecimal estimatedCost,
        Instant createdAt,
        Instant receivedAt
) {
    public static ProductionOrderDto from(ProductionOrder order) {
        return new ProductionOrderDto(
                order.getId(),
                order.getBook().getId(),
                order.getBook().getTitle(),
                order.getCreatedBy() == null ? null : order.getCreatedBy().getId(),
                order.getCreatedBy() == null ? null : order.getCreatedBy().getName(),
                order.getQuantity(),
                order.getPrinter(),
                order.getExpectedDeliveryDate(),
                order.getNotes(),
                order.getStatus(),
                order.getEstimatedCost(),
                order.getCreatedAt(),
                order.getReceivedAt()
        );
    }
}
