package com.adventist.backend.analytics;

import com.adventist.backend.customers.CustomerType;
import com.adventist.backend.production.ProductionOrderStatus;
import com.adventist.backend.sales.FulfillmentMethod;
import com.adventist.backend.sales.PaymentStatus;
import com.adventist.backend.sales.SaleStatus;

import java.time.LocalDate;

public record AdminAnalyticsFilter(
        LocalDate from,
        LocalDate to,
        String category,
        CustomerType customerType,
        SaleStatus saleStatus,
        PaymentStatus paymentStatus,
        FulfillmentMethod fulfillmentMethod,
        ProductionOrderStatus productionStatus
) {
    boolean hasCategory() {
        return category != null && !category.isBlank();
    }
}
