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
        String receiptNumber,
        PaymentStatus paymentStatus,
        PaymentMethod paymentMethod,
        String paymentReference,
        BigDecimal amountPaid,
        BigDecimal balanceDue,
        FulfillmentMethod fulfillmentMethod,
        String deliveryContact,
        String deliveryAddress,
        String customerNote,
        String internalNote,
        Instant createdAt,
        Instant updatedAt,
        Instant deliveredAt,
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
                sale.getReceiptNumber(),
                sale.getPaymentStatus(),
                sale.getPaymentMethod(),
                sale.getPaymentReference(),
                sale.getAmountPaid(),
                sale.getTotal().subtract(sale.getAmountPaid()).max(BigDecimal.ZERO),
                sale.getFulfillmentMethod(),
                sale.getDeliveryContact(),
                sale.getDeliveryAddress(),
                sale.getCustomerNote(),
                sale.getInternalNote(),
                sale.getCreatedAt(),
                sale.getUpdatedAt(),
                sale.getDeliveredAt(),
                sale.getItems().stream().map(SaleItemDto::from).toList()
        );
    }
}
