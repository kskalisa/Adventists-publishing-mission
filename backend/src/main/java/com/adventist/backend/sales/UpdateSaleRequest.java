package com.adventist.backend.sales;

import java.math.BigDecimal;
import java.util.List;

public record UpdateSaleRequest(
        SaleStatus status,
        BigDecimal discount,
        PaymentMethod paymentMethod,
        String paymentReference,
        BigDecimal amountPaid,
        FulfillmentMethod fulfillmentMethod,
        String deliveryContact,
        String deliveryAddress,
        String customerNote,
        String internalNote,
        List<SaleItemRequest> items
) {
}
