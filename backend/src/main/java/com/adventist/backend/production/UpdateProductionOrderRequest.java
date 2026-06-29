package com.adventist.backend.production;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateProductionOrderRequest(
        Integer quantity,
        String printer,
        LocalDate expectedDeliveryDate,
        String notes,
        BigDecimal estimatedCost,
        ProductionOrderStatus status
) {
}
