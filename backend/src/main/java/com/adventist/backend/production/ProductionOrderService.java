package com.adventist.backend.production;

import com.adventist.backend.audit.AuditService;
import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.bookrequests.BookRequestRepository;
import com.adventist.backend.bookrequests.BookRequestStatus;
import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.inventory.AdjustmentType;
import com.adventist.backend.inventory.StockAdjustment;
import com.adventist.backend.inventory.StockAdjustmentRepository;
import com.adventist.backend.notifications.NotificationService;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.UserRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
public class ProductionOrderService {
    private final ProductionOrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final StockAdjustmentRepository adjustmentRepository;
    private final BookRequestRepository bookRequestRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ProductionOrderService(ProductionOrderRepository orderRepository, BookRepository bookRepository, StockAdjustmentRepository adjustmentRepository, BookRequestRepository bookRequestRepository, NotificationService notificationService, AuditService auditService) {
        this.orderRepository = orderRepository;
        this.bookRepository = bookRepository;
        this.adjustmentRepository = adjustmentRepository;
        this.bookRequestRepository = bookRequestRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<ProductionOrderDto> listOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(ProductionOrderDto::from).toList();
    }

    @Transactional
    public ProductionOrderDto createOrder(CreateProductionOrderRequest request, AppUser createdBy) {
        Book book = bookRepository.findById(request.bookId()).orElseThrow(() -> new ResourceNotFoundException("book not found"));
        int quantity = validateQuantity(request.quantity());
        String printer = requireText(request.printer(), "printer");
        BigDecimal estimatedCost = estimatedCost(request.estimatedCost(), book, quantity);
        ProductionOrder order = new ProductionOrder(book, createdBy, quantity, printer, validateExpectedDeliveryDate(request.expectedDeliveryDate()), clean(request.notes()), estimatedCost);
        ProductionOrder saved = orderRepository.save(order);
        auditService.record(createdBy, "PRODUCTION_ORDER_CREATED", "PRODUCTION_ORDER", saved.getId(), "Created print order for " + book.getTitle() + " (" + quantity + " units)");
        notifyProductionLeads("New production request", (createdBy == null ? "A user" : createdBy.getName()) + " requested " + quantity + " unit(s) of " + book.getTitle() + ".");
        return ProductionOrderDto.from(saved);
    }

    @Transactional
    public ProductionOrderDto updateOrder(Long id, UpdateProductionOrderRequest request, AppUser actor) {
        ProductionOrder order = findOrder(id);
        if (order.getStatus() == ProductionOrderStatus.RECEIVED || order.getStatus() == ProductionOrderStatus.CANCELLED) {
            throw new IllegalArgumentException("received or cancelled orders cannot be edited");
        }
        int quantity = validateQuantity(request.quantity());
        order.setQuantity(quantity);
        order.setPrinter(requireText(request.printer(), "printer"));
        order.setExpectedDeliveryDate(validateExpectedDeliveryDate(request.expectedDeliveryDate()));
        order.setNotes(clean(request.notes()));
        order.setEstimatedCost(estimatedCost(request.estimatedCost(), order.getBook(), quantity));
        if (request.status() != null) {
            receiveStockIfNeeded(order, request.status(), actor);
            order.setStatus(request.status());
        }
        auditService.record(actor, "PRODUCTION_ORDER_UPDATED", "PRODUCTION_ORDER", order.getId(), "Updated print order #PO-" + String.format("%04d", order.getId()) + " to " + order.getStatus());
        if (request.status() != ProductionOrderStatus.RECEIVED) {
            notifyCreator(order, actor, "Production order updated", "Order #PO-" + String.format("%04d", order.getId()) + " for " + order.getBook().getTitle() + " is now " + order.getStatus() + ".");
        }
        return ProductionOrderDto.from(order);
    }

    @Transactional
    public ProductionOrderDto cancelOrder(Long id, AppUser actor) {
        ProductionOrder order = findOrder(id);
        if (order.getStatus() == ProductionOrderStatus.RECEIVED) {
            throw new IllegalArgumentException("received orders cannot be cancelled");
        }
        order.setStatus(ProductionOrderStatus.CANCELLED);
        auditService.record(actor, "PRODUCTION_ORDER_CANCELLED", "PRODUCTION_ORDER", order.getId(), "Cancelled print order #PO-" + String.format("%04d", order.getId()));
        notifyCreator(order, actor, "Production order cancelled", "Order #PO-" + String.format("%04d", order.getId()) + " for " + order.getBook().getTitle() + " was cancelled.");
        return ProductionOrderDto.from(order);
    }

    @Transactional
    public void deleteOrder(Long id, AppUser actor) {
        ProductionOrder order = findOrder(id);
        if (order.getStatus() == ProductionOrderStatus.RECEIVED) {
            throw new IllegalArgumentException("received orders cannot be deleted");
        }
        auditService.record(actor, "PRODUCTION_ORDER_DELETED", "PRODUCTION_ORDER", order.getId(), "Deleted print order #PO-" + String.format("%04d", order.getId()));
        notifyCreator(order, actor, "Production order deleted", "Order #PO-" + String.format("%04d", order.getId()) + " for " + order.getBook().getTitle() + " was deleted.");
        orderRepository.delete(order);
    }

    private ProductionOrder findOrder(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("production order not found"));
    }

    private int validateQuantity(Integer quantity) {
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
        return quantity;
    }

    private BigDecimal estimatedCost(BigDecimal requested, Book book, int quantity) {
        if (requested != null) {
            if (requested.compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("estimatedCost must be zero or greater");
            }
            return requested;
        }
        return book.getPrice().multiply(BigDecimal.valueOf(quantity));
    }

    private LocalDate validateExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        if (expectedDeliveryDate != null && expectedDeliveryDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("expectedDeliveryDate cannot be in the past");
        }
        return expectedDeliveryDate;
    }

    private String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " is required");
        }
        return value.trim();
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private void receiveStockIfNeeded(ProductionOrder order, ProductionOrderStatus nextStatus, AppUser actor) {
        if (nextStatus != ProductionOrderStatus.RECEIVED || order.getStatus() == ProductionOrderStatus.RECEIVED) {
            return;
        }
        Book book = order.getBook();
        int previousQuantity = book.getStockQuantity();
        book.setStockQuantity(previousQuantity + order.getQuantity());
        order.setReceivedAt(Instant.now());
        adjustmentRepository.save(new StockAdjustment(
                book,
                order.getCreatedBy(),
                AdjustmentType.REPRINT_RECEIVED,
                order.getQuantity(),
                "Received production order #PO-" + String.format("%04d", order.getId())
        ));
        auditService.record(order.getCreatedBy(), "PRODUCTION_ORDER_RECEIVED", "PRODUCTION_ORDER", order.getId(), "Received " + order.getQuantity() + " unit(s) of " + book.getTitle() + " into stock");
        notifyCreator(order, actor, "Production order received", order.getQuantity() + " unit(s) of " + book.getTitle() + " were received into stock.");
        if (previousQuantity <= 0 && book.getStockQuantity() > 0) {
            bookRequestRepository.findByBookAndStatus(book, BookRequestStatus.OPEN)
                    .forEach(bookRequest -> notificationService.create(
                            bookRequest.getCustomer(),
                            "Requested book restocked",
                            book.getTitle() + " is back in stock after a new print run."
                    ));
        }
    }

    private void notifyProductionLeads(String title, String message) {
        notificationService.createForRole(UserRole.COORDINATOR, title, message);
        notificationService.createForRole(UserRole.ADMIN, title, message);
    }

    private void notifyCreator(ProductionOrder order, AppUser actor, String title, String message) {
        AppUser creator = order.getCreatedBy();
        if (creator != null && (actor == null || actor.getId() == null || !actor.getId().equals(creator.getId()))) {
            notificationService.create(creator, title, message);
        }
    }
}
