package com.adventist.backend.sales;

import com.adventist.backend.customers.Customer;
import com.adventist.backend.users.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    private AppUser cashier;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status = SaleStatus.PAID;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total = BigDecimal.ZERO;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SaleItem> items = new ArrayList<>();

    protected Sale() {
    }

    public Sale(Customer customer, AppUser cashier, SaleStatus status, BigDecimal discount) {
        this.customer = customer;
        this.cashier = cashier;
        this.status = status == null ? SaleStatus.PAID : status;
        this.discount = discount == null ? BigDecimal.ZERO : discount;
    }

    public void addItem(SaleItem item) {
        item.setSale(this);
        items.add(item);
    }

    public void recalculate() {
        subtotal = items.stream().map(SaleItem::getLineTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        tax = subtotal.subtract(discount).max(BigDecimal.ZERO).multiply(new BigDecimal("0.18"));
        total = subtotal.subtract(discount).add(tax).max(BigDecimal.ZERO);
    }

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public AppUser getCashier() { return cashier; }
    public SaleStatus getStatus() { return status; }
    public BigDecimal getSubtotal() { return subtotal; }
    public BigDecimal getTax() { return tax; }
    public BigDecimal getDiscount() { return discount; }
    public BigDecimal getTotal() { return total; }
    public Instant getCreatedAt() { return createdAt; }
    public List<SaleItem> getItems() { return items; }
}
