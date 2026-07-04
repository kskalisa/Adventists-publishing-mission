package com.adventist.backend.analytics;

import com.adventist.backend.production.ProductionOrderStatus;
import com.adventist.backend.sales.FulfillmentMethod;
import com.adventist.backend.sales.PaymentMethod;
import com.adventist.backend.sales.PaymentStatus;
import com.adventist.backend.sales.SaleStatus;

import java.math.BigDecimal;
import java.util.List;

public record AdminAnalyticsSummary(
        Overview overview,
        List<TimeSeriesPoint> revenueTrend,
        List<NamedMetric> salesByStatus,
        List<NamedMetric> paymentBreakdown,
        List<NamedMetric> fulfillmentBreakdown,
        List<NamedMetric> customerTypeBreakdown,
        List<NamedMetric> inventoryByCategory,
        List<TitleMetric> topSellingTitles,
        List<CustomerMetric> topCustomers,
        List<InventoryRisk> inventoryRisks,
        List<DemandMetric> reprintDemand,
        List<ProductionMetric> productionPipeline,
        List<String> recommendations
) {
    public record Overview(
            long totalBooks,
            long activeCustomers,
            long totalSales,
            long openCustomerOrders,
            long stockAlerts,
            long openBookRequests,
            BigDecimal grossRevenue,
            BigDecimal paidRevenue,
            BigDecimal outstandingBalance,
            BigDecimal cancelledOrRejectedValue,
            BigDecimal averageOrderValue,
            BigDecimal stockValue,
            BigDecimal productionPlannedCost,
            BigDecimal productionReceivedCost
    ) {
    }

    public record TimeSeriesPoint(String label, BigDecimal value, long count) {
    }

    public record NamedMetric(String name, long count, BigDecimal value) {
    }

    public record TitleMetric(Long bookId, String title, String category, long unitsSold, BigDecimal revenue, int stockQuantity, int reorderLevel) {
    }

    public record CustomerMetric(Long customerId, String name, String type, long orderCount, BigDecimal revenue, BigDecimal outstandingBalance) {
    }

    public record InventoryRisk(Long bookId, String title, String category, int stockQuantity, int reorderLevel, long unitsSold, long requestedQuantity, String riskLevel, int suggestedReorderQuantity) {
    }

    public record DemandMetric(Long bookId, String title, long customerCount, long requestedQuantity, int stockQuantity, int reorderLevel) {
    }

    public record ProductionMetric(ProductionOrderStatus status, long orders, int units, BigDecimal estimatedCost) {
    }

    public record PaymentMethodMetric(PaymentMethod method, long count, BigDecimal value) {
    }

    public record PaymentStatusMetric(PaymentStatus status, long count, BigDecimal value) {
    }

    public record SaleStatusMetric(SaleStatus status, long count, BigDecimal value) {
    }

    public record FulfillmentMetric(FulfillmentMethod method, long count, BigDecimal value) {
    }
}
