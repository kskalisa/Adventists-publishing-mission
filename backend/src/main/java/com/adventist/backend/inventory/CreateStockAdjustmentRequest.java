package com.adventist.backend.inventory;

public record CreateStockAdjustmentRequest(Long bookId, Long adjustedById, AdjustmentType type, Integer quantityDelta, String note) {
}
