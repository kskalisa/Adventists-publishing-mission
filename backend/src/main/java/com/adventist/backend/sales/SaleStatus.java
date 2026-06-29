package com.adventist.backend.sales;

public enum SaleStatus {
    PENDING,
    APPROVED,
    PROCESSING,
    SHIPPED,
    DELIVERED,
    REJECTED,
    /** Legacy completed sale status used by point-of-sale transactions. */
    PAID,
    /** Legacy held status used by earlier customer order requests. */
    HELD,
    CANCELLED
}
