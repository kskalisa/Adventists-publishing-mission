package com.adventist.backend.production;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateProductionOrderRequest(
        Long bookId,
        Integer quantity,
        String printer,
        LocalDate expectedDeliveryDate,
        String notes,
        BigDecimal estimatedCost
) {
}
