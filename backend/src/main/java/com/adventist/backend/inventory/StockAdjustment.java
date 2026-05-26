package com.adventist.backend.inventory;

import com.adventist.backend.books.Book;
import com.adventist.backend.users.AppUser;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "stock_adjustments")
public class StockAdjustment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    private AppUser adjustedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdjustmentType type;

    @Column(nullable = false)
    private int quantityDelta;

    private String note;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected StockAdjustment() {
    }

    public StockAdjustment(Book book, AppUser adjustedBy, AdjustmentType type, int quantityDelta, String note) {
        this.book = book;
        this.adjustedBy = adjustedBy;
        this.type = type;
        this.quantityDelta = quantityDelta;
        this.note = note;
    }

    public Long getId() { return id; }
    public Book getBook() { return book; }
    public AppUser getAdjustedBy() { return adjustedBy; }
    public AdjustmentType getType() { return type; }
    public int getQuantityDelta() { return quantityDelta; }
    public String getNote() { return note; }
    public Instant getCreatedAt() { return createdAt; }
}
