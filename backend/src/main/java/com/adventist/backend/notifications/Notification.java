package com.adventist.backend.notifications;

import com.adventist.backend.customers.Customer;
import com.adventist.backend.users.AppUser;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    private AppUser user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 700)
    private String message;

    @Column(nullable = false)
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected Notification() {
    }

    public Notification(Customer customer, String title, String message) {
        this.customer = customer;
        this.title = title;
        this.message = message;
    }

    public Notification(AppUser user, String title, String message) {
        this.user = user;
        this.title = title;
        this.message = message;
    }

    public Long getId() { return id; }
    public Customer getCustomer() { return customer; }
    public AppUser getUser() { return user; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public Instant getCreatedAt() { return createdAt; }
}
