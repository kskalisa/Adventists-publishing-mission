package com.adventist.backend.analytics;

import com.adventist.backend.bookrequests.BookRequest;
import com.adventist.backend.bookrequests.BookRequestRepository;
import com.adventist.backend.bookrequests.BookRequestStatus;
import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.production.ProductionOrder;
import com.adventist.backend.production.ProductionOrderRepository;
import com.adventist.backend.production.ProductionOrderStatus;
import com.adventist.backend.sales.PaymentMethod;
import com.adventist.backend.sales.Sale;
import com.adventist.backend.sales.SaleItem;
import com.adventist.backend.sales.SaleRepository;
import com.adventist.backend.sales.SaleStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminAnalyticsService {
    private static final BigDecimal ZERO = BigDecimal.ZERO;
    private static final DateTimeFormatter DAY_FORMAT = DateTimeFormatter.ofPattern("MMM d").withZone(ZoneId.systemDefault());

    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final BookRequestRepository bookRequestRepository;
    private final ProductionOrderRepository productionOrderRepository;

    public AdminAnalyticsService(BookRepository bookRepository, CustomerRepository customerRepository, SaleRepository saleRepository, BookRequestRepository bookRequestRepository, ProductionOrderRepository productionOrderRepository) {
        this.bookRepository = bookRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
        this.bookRequestRepository = bookRequestRepository;
        this.productionOrderRepository = productionOrderRepository;
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsSummary summary() {
        return summary(new AdminAnalyticsFilter(null, null, null, null, null, null, null, null));
    }

    @Transactional(readOnly = true)
    public AdminAnalyticsSummary summary(AdminAnalyticsFilter filter) {
        AdminAnalyticsFilter activeFilter = filter == null ? new AdminAnalyticsFilter(null, null, null, null, null, null, null, null) : filter;
        Instant fromInstant = activeFilter.from() == null ? null : activeFilter.from().atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant toInstant = activeFilter.to() == null ? null : activeFilter.to().plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();

        List<Book> books = bookRepository.findAll();
        List<Customer> customers = customerRepository.findAll();
        List<Sale> sales = saleRepository.findAllByOrderByCreatedAtDesc();
        List<BookRequest> bookRequests = bookRequestRepository.findAllByOrderByCreatedAtDesc();
        List<ProductionOrder> productionOrders = productionOrderRepository.findAllByOrderByCreatedAtDesc();

        books = books.stream().filter(book -> matchesBook(book, activeFilter)).toList();
        customers = customers.stream().filter(customer -> matchesCustomer(customer, activeFilter, fromInstant, toInstant)).toList();
        sales = sales.stream().filter(sale -> matchesSale(sale, activeFilter, fromInstant, toInstant)).toList();
        bookRequests = bookRequests.stream().filter(request -> matchesBookRequest(request, activeFilter, fromInstant, toInstant)).toList();
        productionOrders = productionOrders.stream().filter(order -> matchesProductionOrder(order, activeFilter, fromInstant, toInstant)).toList();

        Map<Long, Long> unitsSoldByBook = new HashMap<>();
        Map<Long, BigDecimal> revenueByBook = new HashMap<>();
        Map<Long, Long> requestedByBook = new HashMap<>();
        Map<Long, Long> requestCustomersByBook = new HashMap<>();
        Map<Long, CustomerAccumulator> customerTotals = new HashMap<>();

        BigDecimal grossRevenue = ZERO;
        BigDecimal paidRevenue = ZERO;
        BigDecimal outstandingBalance = ZERO;
        BigDecimal cancelledOrRejectedValue = ZERO;
        long openCustomerOrders = 0;

        Map<SaleStatus, AdminAnalyticsSummary.NamedMetric> statusMetrics = new EnumMap<>(SaleStatus.class);
        Map<PaymentMethod, AdminAnalyticsSummary.NamedMetric> paymentMetrics = new EnumMap<>(PaymentMethod.class);
        Map<String, AdminAnalyticsSummary.NamedMetric> fulfillmentMetrics = new HashMap<>();
        Map<String, AdminAnalyticsSummary.TimeSeriesPoint> revenueTrend = new HashMap<>();

        for (Sale sale : sales) {
            BigDecimal total = nz(sale.getTotal());
            BigDecimal amountPaid = nz(sale.getAmountPaid());
            BigDecimal balance = total.subtract(amountPaid).max(ZERO);
            grossRevenue = grossRevenue.add(total);
            paidRevenue = paidRevenue.add(amountPaid);
            outstandingBalance = outstandingBalance.add(balance);
            if (sale.getStatus() == SaleStatus.CANCELLED || sale.getStatus() == SaleStatus.REJECTED) {
                cancelledOrRejectedValue = cancelledOrRejectedValue.add(total);
            }
            if (sale.getStatus() == SaleStatus.PENDING || sale.getStatus() == SaleStatus.APPROVED || sale.getStatus() == SaleStatus.PROCESSING || sale.getStatus() == SaleStatus.SHIPPED || sale.getPaymentStatus().name().equals("UNPAID") || sale.getPaymentStatus().name().equals("PARTIAL")) {
                openCustomerOrders++;
            }

            statusMetrics.merge(sale.getStatus(), named(sale.getStatus().name(), 1, total), AdminAnalyticsService::mergeNamed);
            if (sale.getPaymentMethod() != null) {
                paymentMetrics.merge(sale.getPaymentMethod(), named(sale.getPaymentMethod().name(), 1, amountPaid), AdminAnalyticsService::mergeNamed);
            }
            fulfillmentMetrics.merge(sale.getFulfillmentMethod().name(), named(sale.getFulfillmentMethod().name(), 1, total), AdminAnalyticsService::mergeNamed);
            String day = DAY_FORMAT.format(sale.getCreatedAt());
            revenueTrend.merge(day, new AdminAnalyticsSummary.TimeSeriesPoint(day, amountPaid, 1), AdminAnalyticsService::mergePoint);

            if (sale.getCustomer() != null) {
                customerTotals.computeIfAbsent(sale.getCustomer().getId(), id -> new CustomerAccumulator(sale.getCustomer()))
                        .add(total, balance);
            }
            for (SaleItem item : sale.getItems()) {
                Long bookId = item.getBook().getId();
                unitsSoldByBook.merge(bookId, (long) item.getQuantity(), Long::sum);
                revenueByBook.merge(bookId, nz(item.getLineTotal()), BigDecimal::add);
            }
        }

        for (BookRequest request : bookRequests) {
            if (request.getStatus() == BookRequestStatus.OPEN) {
                Long bookId = request.getBook().getId();
                requestedByBook.merge(bookId, (long) request.getQuantity(), Long::sum);
            }
        }
        Map<Long, java.util.Set<Long>> requestCustomerSets = new HashMap<>();
        for (BookRequest request : bookRequests) {
            if (request.getStatus() == BookRequestStatus.OPEN) {
                requestCustomerSets.computeIfAbsent(request.getBook().getId(), id -> new java.util.HashSet<>()).add(request.getCustomer().getId());
            }
        }
        requestCustomerSets.forEach((bookId, set) -> requestCustomersByBook.put(bookId, (long) set.size()));

        BigDecimal stockValue = books.stream()
                .map(book -> nz(book.getPrice()).multiply(BigDecimal.valueOf(book.getStockQuantity())))
                .reduce(ZERO, BigDecimal::add);
        long stockAlerts = books.stream().filter(book -> book.getStockQuantity() <= book.getReorderLevel()).count();
        long openBookRequests = bookRequests.stream().filter(request -> request.getStatus() == BookRequestStatus.OPEN).count();
        BigDecimal averageOrderValue = sales.isEmpty() ? ZERO : grossRevenue.divide(BigDecimal.valueOf(sales.size()), 2, RoundingMode.HALF_UP);

        Map<String, AdminAnalyticsSummary.NamedMetric> customerTypes = new HashMap<>();
        customers.forEach(customer -> customerTypes.merge(customer.getType().name(), named(customer.getType().name(), 1, ZERO), AdminAnalyticsService::mergeNamed));
        Map<String, AdminAnalyticsSummary.NamedMetric> categoryMetrics = new HashMap<>();
        books.forEach(book -> categoryMetrics.merge(book.getCategory(), named(book.getCategory(), 1, nz(book.getPrice()).multiply(BigDecimal.valueOf(book.getStockQuantity()))), AdminAnalyticsService::mergeNamed));

        List<AdminAnalyticsSummary.TitleMetric> topTitles = books.stream()
                .map(book -> new AdminAnalyticsSummary.TitleMetric(book.getId(), book.getTitle(), book.getCategory(), unitsSoldByBook.getOrDefault(book.getId(), 0L), revenueByBook.getOrDefault(book.getId(), ZERO), book.getStockQuantity(), book.getReorderLevel()))
                .sorted(Comparator.comparing(AdminAnalyticsSummary.TitleMetric::unitsSold).reversed().thenComparing(AdminAnalyticsSummary.TitleMetric::revenue, Comparator.reverseOrder()))
                .limit(8)
                .toList();

        List<AdminAnalyticsSummary.CustomerMetric> topCustomers = customerTotals.values().stream()
                .map(CustomerAccumulator::toMetric)
                .sorted(Comparator.comparing(AdminAnalyticsSummary.CustomerMetric::revenue).reversed())
                .limit(8)
                .toList();

        List<AdminAnalyticsSummary.InventoryRisk> inventoryRisks = books.stream()
                .map(book -> risk(book, unitsSoldByBook.getOrDefault(book.getId(), 0L), requestedByBook.getOrDefault(book.getId(), 0L)))
                .filter(risk -> !"NORMAL".equals(risk.riskLevel()))
                .sorted(Comparator.comparing(AdminAnalyticsSummary.InventoryRisk::riskLevel).thenComparing(AdminAnalyticsSummary.InventoryRisk::suggestedReorderQuantity).reversed())
                .limit(12)
                .toList();

        List<AdminAnalyticsSummary.DemandMetric> reprintDemand = books.stream()
                .map(book -> new AdminAnalyticsSummary.DemandMetric(book.getId(), book.getTitle(), requestCustomersByBook.getOrDefault(book.getId(), 0L), requestedByBook.getOrDefault(book.getId(), 0L), book.getStockQuantity(), book.getReorderLevel()))
                .filter(metric -> metric.requestedQuantity() > 0)
                .sorted(Comparator.comparing(AdminAnalyticsSummary.DemandMetric::requestedQuantity).reversed())
                .limit(10)
                .toList();

        Map<ProductionOrderStatus, AdminAnalyticsSummary.ProductionMetric> productionMetrics = new EnumMap<>(ProductionOrderStatus.class);
        BigDecimal productionPlannedCost = ZERO;
        BigDecimal productionReceivedCost = ZERO;
        for (ProductionOrder order : productionOrders) {
            productionMetrics.merge(order.getStatus(), new AdminAnalyticsSummary.ProductionMetric(order.getStatus(), 1, order.getQuantity(), nz(order.getEstimatedCost())), AdminAnalyticsService::mergeProduction);
            if (order.getStatus() == ProductionOrderStatus.RECEIVED) {
                productionReceivedCost = productionReceivedCost.add(nz(order.getEstimatedCost()));
            } else if (order.getStatus() != ProductionOrderStatus.CANCELLED) {
                productionPlannedCost = productionPlannedCost.add(nz(order.getEstimatedCost()));
            }
        }

        AdminAnalyticsSummary.Overview overview = new AdminAnalyticsSummary.Overview(
                books.size(),
                customers.stream().filter(Customer::isActive).count(),
                sales.size(),
                openCustomerOrders,
                stockAlerts,
                openBookRequests,
                grossRevenue,
                paidRevenue,
                outstandingBalance,
                cancelledOrRejectedValue,
                averageOrderValue,
                stockValue,
                productionPlannedCost,
                productionReceivedCost
        );

        return new AdminAnalyticsSummary(
                overview,
                revenueTrend.values().stream().sorted(Comparator.comparing(AdminAnalyticsSummary.TimeSeriesPoint::label)).toList(),
                fillSaleStatuses(statusMetrics),
                paymentMetrics.values().stream().sorted(Comparator.comparing(AdminAnalyticsSummary.NamedMetric::value).reversed()).toList(),
                fulfillmentMetrics.values().stream().sorted(Comparator.comparing(AdminAnalyticsSummary.NamedMetric::count).reversed()).toList(),
                customerTypes.values().stream().sorted(Comparator.comparing(AdminAnalyticsSummary.NamedMetric::count).reversed()).toList(),
                categoryMetrics.values().stream().sorted(Comparator.comparing(AdminAnalyticsSummary.NamedMetric::value).reversed()).toList(),
                topTitles,
                topCustomers,
                inventoryRisks,
                reprintDemand,
                productionMetrics.values().stream().sorted(Comparator.comparing(metric -> metric.status().name())).toList(),
                recommendations(overview, inventoryRisks, reprintDemand, productionOrders)
        );
    }

    private static boolean matchesBook(Book book, AdminAnalyticsFilter filter) {
        return !filter.hasCategory() || book.getCategory().equalsIgnoreCase(filter.category().trim());
    }

    private static boolean matchesCustomer(Customer customer, AdminAnalyticsFilter filter, Instant from, Instant to) {
        if (filter.customerType() != null && customer.getType() != filter.customerType()) {
            return false;
        }
        return inRange(customer.getCreatedAt(), from, to);
    }

    private static boolean matchesSale(Sale sale, AdminAnalyticsFilter filter, Instant from, Instant to) {
        if (!inRange(sale.getCreatedAt(), from, to)) {
            return false;
        }
        if (filter.saleStatus() != null && sale.getStatus() != filter.saleStatus()) {
            return false;
        }
        if (filter.paymentStatus() != null && sale.getPaymentStatus() != filter.paymentStatus()) {
            return false;
        }
        if (filter.fulfillmentMethod() != null && sale.getFulfillmentMethod() != filter.fulfillmentMethod()) {
            return false;
        }
        if (filter.customerType() != null && (sale.getCustomer() == null || sale.getCustomer().getType() != filter.customerType())) {
            return false;
        }
        return !filter.hasCategory() || sale.getItems().stream().anyMatch(item -> matchesBook(item.getBook(), filter));
    }

    private static boolean matchesBookRequest(BookRequest request, AdminAnalyticsFilter filter, Instant from, Instant to) {
        if (!inRange(request.getCreatedAt(), from, to)) {
            return false;
        }
        if (filter.customerType() != null && request.getCustomer().getType() != filter.customerType()) {
            return false;
        }
        return matchesBook(request.getBook(), filter);
    }

    private static boolean matchesProductionOrder(ProductionOrder order, AdminAnalyticsFilter filter, Instant from, Instant to) {
        if (!inRange(order.getCreatedAt(), from, to)) {
            return false;
        }
        if (filter.productionStatus() != null && order.getStatus() != filter.productionStatus()) {
            return false;
        }
        return matchesBook(order.getBook(), filter);
    }

    private static boolean inRange(Instant value, Instant from, Instant to) {
        if (value == null) {
            return false;
        }
        return (from == null || !value.isBefore(from)) && (to == null || value.isBefore(to));
    }

    private static List<AdminAnalyticsSummary.NamedMetric> fillSaleStatuses(Map<SaleStatus, AdminAnalyticsSummary.NamedMetric> source) {
        List<AdminAnalyticsSummary.NamedMetric> metrics = new ArrayList<>();
        for (SaleStatus status : SaleStatus.values()) {
            metrics.add(source.getOrDefault(status, named(status.name(), 0, ZERO)));
        }
        return metrics;
    }

    private static AdminAnalyticsSummary.InventoryRisk risk(Book book, long unitsSold, long requestedQuantity) {
        int suggested = Math.max(book.getReorderLevel() * 2 - book.getStockQuantity(), 0) + (int) Math.min(requestedQuantity, 100);
        String level = "NORMAL";
        if (book.getStockQuantity() <= 0) {
            level = "OUT_OF_STOCK";
        } else if (book.getStockQuantity() <= book.getReorderLevel()) {
            level = "LOW_STOCK";
        } else if (requestedQuantity > 0 && book.getStockQuantity() <= book.getReorderLevel() * 2) {
            level = "DEMAND_RISK";
        } else if (unitsSold >= book.getStockQuantity() && unitsSold > 0) {
            level = "FAST_MOVING";
        }
        return new AdminAnalyticsSummary.InventoryRisk(book.getId(), book.getTitle(), book.getCategory(), book.getStockQuantity(), book.getReorderLevel(), unitsSold, requestedQuantity, level, suggested);
    }

    private static List<String> recommendations(AdminAnalyticsSummary.Overview overview, List<AdminAnalyticsSummary.InventoryRisk> risks, List<AdminAnalyticsSummary.DemandMetric> demand, List<ProductionOrder> productionOrders) {
        List<String> items = new ArrayList<>();
        if (overview.totalBooks() == 0) {
            items.add("Add book catalog records before relying on analytics.");
        }
        if (overview.totalSales() == 0) {
            items.add("Create POS sales or approve customer orders to activate revenue analytics.");
        }
        if (overview.outstandingBalance().compareTo(ZERO) > 0) {
            items.add("Review unpaid and partial orders; outstanding balance is " + overview.outstandingBalance() + ".");
        }
        if (!risks.isEmpty()) {
            items.add("Prioritize stock replenishment for " + risks.size() + " at-risk title(s).");
        }
        if (!demand.isEmpty()) {
            items.add("Convert open customer book requests into production orders for high-demand titles.");
        }
        boolean hasActiveProduction = productionOrders.stream().anyMatch(order -> order.getStatus() == ProductionOrderStatus.PLANNED || order.getStatus() == ProductionOrderStatus.APPROVED || order.getStatus() == ProductionOrderStatus.IN_PROGRESS);
        if (!hasActiveProduction && !risks.isEmpty()) {
            items.add("Create production orders for low-stock or out-of-stock titles.");
        }
        if (items.isEmpty()) {
            items.add("Operations look healthy. Continue monitoring sales, stock, and production weekly.");
        }
        return items;
    }

    private static AdminAnalyticsSummary.NamedMetric named(String name, long count, BigDecimal value) {
        return new AdminAnalyticsSummary.NamedMetric(name, count, nz(value));
    }

    private static AdminAnalyticsSummary.NamedMetric mergeNamed(AdminAnalyticsSummary.NamedMetric left, AdminAnalyticsSummary.NamedMetric right) {
        return new AdminAnalyticsSummary.NamedMetric(left.name(), left.count() + right.count(), left.value().add(right.value()));
    }

    private static AdminAnalyticsSummary.TimeSeriesPoint mergePoint(AdminAnalyticsSummary.TimeSeriesPoint left, AdminAnalyticsSummary.TimeSeriesPoint right) {
        return new AdminAnalyticsSummary.TimeSeriesPoint(left.label(), left.value().add(right.value()), left.count() + right.count());
    }

    private static AdminAnalyticsSummary.ProductionMetric mergeProduction(AdminAnalyticsSummary.ProductionMetric left, AdminAnalyticsSummary.ProductionMetric right) {
        return new AdminAnalyticsSummary.ProductionMetric(left.status(), left.orders() + right.orders(), left.units() + right.units(), left.estimatedCost().add(right.estimatedCost()));
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? ZERO : value;
    }

    private static class CustomerAccumulator {
        private final Customer customer;
        private long orderCount;
        private BigDecimal revenue = ZERO;
        private BigDecimal outstanding = ZERO;

        CustomerAccumulator(Customer customer) {
            this.customer = customer;
        }

        void add(BigDecimal saleTotal, BigDecimal balance) {
            orderCount++;
            revenue = revenue.add(nz(saleTotal));
            outstanding = outstanding.add(nz(balance));
        }

        AdminAnalyticsSummary.CustomerMetric toMetric() {
            return new AdminAnalyticsSummary.CustomerMetric(customer.getId(), customer.getName(), customer.getType().name(), orderCount, revenue, outstanding);
        }
    }
}




