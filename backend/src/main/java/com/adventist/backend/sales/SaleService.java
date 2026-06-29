package com.adventist.backend.sales;

import com.adventist.backend.audit.AuditService;
import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.notifications.NotificationService;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class SaleService {
    private final SaleRepository saleRepository;
    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public SaleService(SaleRepository saleRepository, BookRepository bookRepository, CustomerRepository customerRepository, AppUserRepository userRepository, NotificationService notificationService, AuditService auditService) {
        this.saleRepository = saleRepository;
        this.bookRepository = bookRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<SaleDto> listRecentSales() {
        return saleRepository.findAllByOrderByCreatedAtDesc().stream().map(SaleDto::from).toList();
    }

    @Transactional(readOnly = true)
    public SaleDto getSale(Long id) {
        return SaleDto.from(saleRepository.findDetailedById(id).orElseThrow(() -> new ResourceNotFoundException("sale not found")));
    }

    @Transactional
    public SaleDto createSale(CreateSaleRequest request, AppUser user) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("at least one sale item is required");
        }
        Customer customer = resolveCustomer(request, user);
        AppUser cashier = resolveCashier(request, user);
        SaleStatus status = user != null && user.getRole() == UserRole.CUSTOMER ? SaleStatus.PENDING : request.status();
        Sale sale = new Sale(customer, cashier, status, request.discount());
        sale.setCustomerNote(clean(request.customerNote()));
        sale.setFulfillmentMethod(request.fulfillmentMethod());
        sale.setDeliveryContact(clean(request.deliveryContact()));
        sale.setDeliveryAddress(clean(request.deliveryAddress()));

        applyItems(sale, request.items());
        sale.recalculate();
        applyPayment(sale, request.paymentMethod(), clean(request.paymentReference()), request.amountPaid());
        Sale saved = saleRepository.save(sale);
        ensureReceipt(saved);
        auditService.record(user, "SALE_CREATED", "SALE", saved.getId(), "Created sale/order " + saved.getReceiptNumber() + " for " + (customer == null ? "Walk-in Customer" : customer.getName()));
        if (customer != null) {
            notificationService.create(customer, "Order submitted", "Order #" + saved.getId() + " was received and is waiting for review.");
        }
        return SaleDto.from(saved);
    }

    private Customer resolveCustomer(CreateSaleRequest request, AppUser user) {
        if (user != null && user.getRole() == UserRole.CUSTOMER) {
            return customerRepository.findByEmailIgnoreCase(user.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("customer profile not found"));
        }
        return request.customerId() == null ? null : customerRepository.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("customer not found"));
    }

    private AppUser resolveCashier(CreateSaleRequest request, AppUser user) {
        if (user != null && (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.SALES)) {
            return user;
        }
        return request.cashierId() == null ? null : userRepository.findById(request.cashierId())
                .orElseThrow(() -> new ResourceNotFoundException("cashier not found"));
    }

    @Transactional(readOnly = true)
    public List<SaleDto> listCustomerSales(AppUser user) {
        if (user == null) {
            return List.of();
        }
        return customerRepository.findByEmailIgnoreCase(user.getEmail())
                .map(customer -> saleRepository.findByCustomerAndHiddenByCustomerFalseOrderByCreatedAtDesc(customer).stream().map(SaleDto::from).toList())
                .orElse(List.of());
    }

    @Transactional
    public SaleDto updateOrder(Long id, UpdateSaleRequest request, AppUser user) {
        Sale sale = findOwnedOrder(id, user);
        if (sale.getStatus() != SaleStatus.PENDING && sale.getStatus() != SaleStatus.HELD) {
            throw new IllegalArgumentException("only pending orders can be edited");
        }
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("at least one sale item is required");
        }
        sale.getItems().forEach(item -> item.getBook().setStockQuantity(item.getBook().getStockQuantity() + item.getQuantity()));
        sale.clearItems();
        sale.setDiscount(request.discount());
        sale.setFulfillmentMethod(request.fulfillmentMethod());
        sale.setDeliveryContact(clean(request.deliveryContact()));
        sale.setDeliveryAddress(clean(request.deliveryAddress()));
        sale.setCustomerNote(clean(request.customerNote()));
        applyItems(sale, request.items());
        sale.recalculate();
        applyPayment(sale, request.paymentMethod(), clean(request.paymentReference()), request.amountPaid());
        return SaleDto.from(sale);
    }

    @Transactional
    public SaleDto cancelOrder(Long id, AppUser user) {
        Sale sale = findOwnedOrder(id, user);
        if (sale.getStatus() == SaleStatus.PROCESSING || sale.getStatus() == SaleStatus.SHIPPED || sale.getStatus() == SaleStatus.DELIVERED || sale.getStatus() == SaleStatus.PAID) {
            throw new IllegalArgumentException("this order can no longer be cancelled by the customer");
        }
        restoreStockIfClosing(sale, SaleStatus.CANCELLED);
        sale.setStatus(SaleStatus.CANCELLED);
        notificationService.create(sale.getCustomer(), "Order cancelled", "Order #" + sale.getId() + " was cancelled.");
        return SaleDto.from(sale);
    }

    @Transactional
    public void hideCustomerOrder(Long id, AppUser user) {
        Sale sale = findOwnedOrder(id, user);
        if (sale.getStatus() != SaleStatus.CANCELLED && sale.getStatus() != SaleStatus.DELIVERED && sale.getStatus() != SaleStatus.PAID && sale.getStatus() != SaleStatus.REJECTED) {
            throw new IllegalArgumentException("only completed, rejected, or cancelled orders can be removed from history");
        }
        sale.setHiddenByCustomer(true);
    }

    @Transactional
    public SaleDto updateOrderStatus(Long id, UpdateSaleRequest request, AppUser actor) {
        Sale sale = saleRepository.findDetailedById(id).orElseThrow(() -> new ResourceNotFoundException("sale not found"));
        SaleStatus previous = sale.getStatus();
        if (request.status() != null) {
            restoreStockIfClosing(sale, request.status());
            sale.setStatus(request.status());
            if (request.status() == SaleStatus.DELIVERED) {
                sale.setDeliveredAt(Instant.now());
            }
        }
        sale.setFulfillmentMethod(request.fulfillmentMethod());
        sale.setDeliveryContact(clean(request.deliveryContact()));
        sale.setDeliveryAddress(clean(request.deliveryAddress()));
        applyPayment(sale, request.paymentMethod(), clean(request.paymentReference()), request.amountPaid());
        sale.setInternalNote(clean(request.internalNote()));
        if (sale.getCustomer() != null && sale.getStatus() != previous) {
            notificationService.create(sale.getCustomer(), "Order status updated", "Order #" + sale.getId() + " is now " + sale.getStatus().name().replace('_', ' ').toLowerCase() + ".");
        }
        auditService.record(actor, "SALE_UPDATED", "SALE", sale.getId(), "Updated order #" + sale.getId() + " from " + previous + " to " + sale.getStatus() + " (" + sale.getPaymentStatus() + ")");
        return SaleDto.from(sale);
    }

    private Sale findOwnedOrder(Long id, AppUser user) {
        if (user == null) {
            throw new ResourceNotFoundException("order not found");
        }
        Sale sale = saleRepository.findDetailedById(id).orElseThrow(() -> new ResourceNotFoundException("order not found"));
        Customer customer = sale.getCustomer();
        if (customer == null || customer.getEmail() == null || !customer.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new ResourceNotFoundException("order not found");
        }
        return sale;
    }

    private void applyItems(Sale sale, List<SaleItemRequest> items) {
        for (SaleItemRequest itemRequest : items) {
            if (itemRequest.quantity() == null || itemRequest.quantity() <= 0) {
                throw new IllegalArgumentException("item quantity must be greater than zero");
            }
            Book book = bookRepository.findById(itemRequest.bookId()).orElseThrow(() -> new ResourceNotFoundException("book not found"));
            int nextQuantity = book.getStockQuantity() - itemRequest.quantity();
            if (nextQuantity < 0) {
                throw new IllegalArgumentException("not enough stock for " + book.getTitle());
            }
            book.setStockQuantity(nextQuantity);
            sale.addItem(new SaleItem(book, itemRequest.quantity(), book.getPrice()));
        }
    }

    private void applyPayment(Sale sale, PaymentMethod paymentMethod, String paymentReference, BigDecimal requestedAmountPaid) {
        BigDecimal amountPaid = requestedAmountPaid;
        if (amountPaid == null && sale.getStatus() == SaleStatus.PAID) {
            amountPaid = sale.getTotal();
        }
        if (amountPaid == null) {
            amountPaid = sale.getAmountPaid();
        }
        if (amountPaid.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("amountPaid must be zero or greater");
        }
        if (amountPaid.compareTo(sale.getTotal()) > 0) {
            throw new IllegalArgumentException("amountPaid cannot exceed order total");
        }
        sale.setAmountPaid(amountPaid);
        sale.setPaymentMethod(paymentMethod == null ? sale.getPaymentMethod() : paymentMethod);
        sale.setPaymentReference(paymentReference == null ? sale.getPaymentReference() : paymentReference);
        if (amountPaid.compareTo(BigDecimal.ZERO) == 0) {
            sale.setPaymentStatus(PaymentStatus.UNPAID);
        } else if (amountPaid.compareTo(sale.getTotal()) < 0) {
            sale.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            sale.setPaymentStatus(PaymentStatus.PAID);
            if (sale.getStatus() != SaleStatus.DELIVERED) {
                sale.setStatus(SaleStatus.PAID);
            }
        }
    }

    private void ensureReceipt(Sale sale) {
        if (sale.getReceiptNumber() == null) {
            sale.setReceiptNumber("APS-" + String.format("%06d", sale.getId()));
        }
    }

    private void restoreStockIfClosing(Sale sale, SaleStatus nextStatus) {
        if ((nextStatus == SaleStatus.CANCELLED || nextStatus == SaleStatus.REJECTED)
                && sale.getStatus() != SaleStatus.CANCELLED
                && sale.getStatus() != SaleStatus.REJECTED) {
            sale.getItems().forEach(item -> item.getBook().setStockQuantity(item.getBook().getStockQuantity() + item.getQuantity()));
        }
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
