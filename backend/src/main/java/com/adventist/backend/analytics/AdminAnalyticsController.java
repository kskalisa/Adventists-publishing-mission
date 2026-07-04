package com.adventist.backend.analytics;

import com.adventist.backend.customers.CustomerType;
import com.adventist.backend.production.ProductionOrderStatus;
import com.adventist.backend.sales.FulfillmentMethod;
import com.adventist.backend.sales.PaymentStatus;
import com.adventist.backend.sales.SaleStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/analytics")
public class AdminAnalyticsController {
    private final AdminAnalyticsService service;

    public AdminAnalyticsController(AdminAnalyticsService service) {
        this.service = service;
    }

    @GetMapping("/admin-summary")
    AdminAnalyticsSummary adminSummary(
            @RequestParam(required = false) LocalDate from,
            @RequestParam(required = false) LocalDate to,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) CustomerType customerType,
            @RequestParam(required = false) SaleStatus saleStatus,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) FulfillmentMethod fulfillmentMethod,
            @RequestParam(required = false) ProductionOrderStatus productionStatus
    ) {
        return service.summary(new AdminAnalyticsFilter(from, to, category, customerType, saleStatus, paymentStatus, fulfillmentMethod, productionStatus));
    }
}
