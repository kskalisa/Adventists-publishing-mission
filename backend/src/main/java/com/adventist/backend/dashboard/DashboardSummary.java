package com.adventist.backend.dashboard;

import com.adventist.backend.books.BookDto;
import com.adventist.backend.sales.SaleDto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummary(
        long totalUsers,
        long totalTitles,
        long totalCustomers,
        BigDecimal totalRevenue,
        BigDecimal monthlyRevenue,
        long lowStockCount,
        long outOfStockCount,
        List<BookDto> lowStockBooks,
        List<SaleDto> recentSales
) {
}
