package com.adventist.backend.sales;

import java.math.BigDecimal;
import java.util.List;

public record CreateSaleRequest(
        Long customerId,
        Long cashierId,
        SaleStatus status,
        BigDecimal discount,
        PaymentMethod paymentMethod,
        String paymentReference,
        BigDecimal amountPaid,
        FulfillmentMethod fulfillmentMethod,
        String deliveryContact,
        String deliveryAddress,
        String customerNote,
        List<SaleItemRequest> items
) {
}
