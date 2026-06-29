package com.adventist.backend.production;

import com.adventist.backend.books.Book;
import com.adventist.backend.users.AppUser;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "production_orders")
public class ProductionOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    private AppUser createdBy;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private String printer;

    private LocalDate expectedDeliveryDate;

    @Column(length = 500)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductionOrderStatus status = ProductionOrderStatus.PLANNED;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal estimatedCost;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    private Instant receivedAt;

    protected ProductionOrder() {
    }

    public ProductionOrder(Book book, AppUser createdBy, int quantity, String printer, LocalDate expectedDeliveryDate, String notes, BigDecimal estimatedCost) {
        this.book = book;
        this.createdBy = createdBy;
        this.quantity = quantity;
        this.printer = printer;
        this.expectedDeliveryDate = expectedDeliveryDate;
        this.notes = notes;
        this.estimatedCost = estimatedCost;
    }

    public Long getId() { return id; }
    public Book getBook() { return book; }
    public AppUser getCreatedBy() { return createdBy; }
    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
    public String getPrinter() { return printer; }
    public void setPrinter(String printer) { this.printer = printer; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public ProductionOrderStatus getStatus() { return status; }
    public void setStatus(ProductionOrderStatus status) { this.status = status; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
}
