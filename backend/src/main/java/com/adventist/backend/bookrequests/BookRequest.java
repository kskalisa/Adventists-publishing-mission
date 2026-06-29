package com.adventist.backend.bookrequests;

import com.adventist.backend.books.Book;
import com.adventist.backend.customers.Customer;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "book_requests")
public class BookRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Customer customer;

    @Column(nullable = false)
    private int quantity;

    @Column(length = 500)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookRequestStatus status = BookRequestStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    protected BookRequest() {
    }

    public BookRequest(Book book, Customer customer, int quantity, String comment) {
        this.book = book;
        this.customer = customer;
        this.quantity = quantity;
        this.comment = comment;
    }

    public Long getId() { return id; }
    public Book getBook() { return book; }
    public Customer getCustomer() { return customer; }
    public int getQuantity() { return quantity; }
    public String getComment() { return comment; }
    public BookRequestStatus getStatus() { return status; }
    public void setStatus(BookRequestStatus status) { this.status = status; this.updatedAt = Instant.now(); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
