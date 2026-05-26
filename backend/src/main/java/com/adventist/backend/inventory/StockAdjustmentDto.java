package com.adventist.backend.inventory;

import java.time.Instant;

public record StockAdjustmentDto(Long id, Long bookId, String bookTitle, Long adjustedById, String adjustedByName, AdjustmentType type, int quantityDelta, String note, Instant createdAt) {
    public static StockAdjustmentDto from(StockAdjustment adjustment) {
        return new StockAdjustmentDto(
                adjustment.getId(),
                adjustment.getBook().getId(),
                adjustment.getBook().getTitle(),
                adjustment.getAdjustedBy() == null ? null : adjustment.getAdjustedBy().getId(),
                adjustment.getAdjustedBy() == null ? null : adjustment.getAdjustedBy().getName(),
                adjustment.getType(),
                adjustment.getQuantityDelta(),
                adjustment.getNote(),
                adjustment.getCreatedAt()
        );
    }
}
