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

    @Column(length = 40, unique = true)
    private String receiptNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Column(length = 120)
    private String paymentReference;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FulfillmentMethod fulfillmentMethod = FulfillmentMethod.PICKUP;

    @Column(length = 255)
    private String deliveryContact;

    @Column(length = 500)
    private String deliveryAddress;

    @Column(length = 500)
    private String customerNote;

    @Column(length = 500)
    private String internalNote;

    @Column(nullable = false)
    private boolean hiddenByCustomer = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    private Instant updatedAt = Instant.now();

    private Instant deliveredAt;

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
    public String getReceiptNumber() { return receiptNumber; }
    public void setReceiptNumber(String receiptNumber) { this.receiptNumber = receiptNumber; touch(); }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus == null ? PaymentStatus.UNPAID : paymentStatus; touch(); }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; touch(); }
    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; touch(); }
    public BigDecimal getAmountPaid() { return amountPaid; }
    public void setAmountPaid(BigDecimal amountPaid) { this.amountPaid = amountPaid == null ? BigDecimal.ZERO : amountPaid; touch(); }
    public FulfillmentMethod getFulfillmentMethod() { return fulfillmentMethod; }
    public void setFulfillmentMethod(FulfillmentMethod fulfillmentMethod) { this.fulfillmentMethod = fulfillmentMethod == null ? FulfillmentMethod.PICKUP : fulfillmentMethod; touch(); }
    public String getDeliveryContact() { return deliveryContact; }
    public void setDeliveryContact(String deliveryContact) { this.deliveryContact = deliveryContact; touch(); }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; touch(); }
    public String getCustomerNote() { return customerNote; }
    public void setCustomerNote(String customerNote) { this.customerNote = customerNote; touch(); }
    public String getInternalNote() { return internalNote; }
    public void setInternalNote(String internalNote) { this.internalNote = internalNote; touch(); }
    public boolean isHiddenByCustomer() { return hiddenByCustomer; }
    public void setHiddenByCustomer(boolean hiddenByCustomer) { this.hiddenByCustomer = hiddenByCustomer; touch(); }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant deliveredAt) { this.deliveredAt = deliveredAt; touch(); }
    public List<SaleItem> getItems() { return items; }

    public void setStatus(SaleStatus status) {
        this.status = status;
        touch();
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount == null ? BigDecimal.ZERO : discount;
        recalculate();
        touch();
    }

    public void clearItems() {
        items.clear();
        touch();
    }

    private void touch() {
        updatedAt = Instant.now();
    }
}
