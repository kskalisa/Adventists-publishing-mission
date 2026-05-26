package com.adventist.backend.sales;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SaleDto(
        Long id,
        Long customerId,
        String customerName,
        Long cashierId,
        String cashierName,
        SaleStatus status,
        BigDecimal subtotal,
        BigDecimal tax,
        BigDecimal discount,
        BigDecimal total,
        Instant createdAt,
        List<SaleItemDto> items
) {
    public static SaleDto from(Sale sale) {
        return new SaleDto(
                sale.getId(),
                sale.getCustomer() == null ? null : sale.getCustomer().getId(),
                sale.getCustomer() == null ? "Walk-in Customer" : sale.getCustomer().getName(),
                sale.getCashier() == null ? null : sale.getCashier().getId(),
                sale.getCashier() == null ? null : sale.getCashier().getName(),
                sale.getStatus(),
                sale.getSubtotal(),
                sale.getTax(),
                sale.getDiscount(),
                sale.getTotal(),
                sale.getCreatedAt(),
                sale.getItems().stream().map(SaleItemDto::from).toList()
        );
    }
}
