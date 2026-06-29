package com.adventist.backend.inventory;

import com.adventist.backend.audit.AuditService;
import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.bookrequests.BookRequestRepository;
import com.adventist.backend.bookrequests.BookRequestStatus;
import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.notifications.NotificationService;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class InventoryService {
    private final StockAdjustmentRepository adjustmentRepository;
    private final BookRepository bookRepository;
    private final AppUserRepository userRepository;
    private final BookRequestRepository bookRequestRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public InventoryService(StockAdjustmentRepository adjustmentRepository, BookRepository bookRepository, AppUserRepository userRepository, BookRequestRepository bookRequestRepository, NotificationService notificationService, AuditService auditService) {
        this.adjustmentRepository = adjustmentRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
        this.bookRequestRepository = bookRequestRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<StockAdjustmentDto> listRecentAdjustments() {
        return adjustmentRepository.findTop20ByOrderByCreatedAtDesc().stream().map(StockAdjustmentDto::from).toList();
    }

    @Transactional
    public StockAdjustmentDto createAdjustment(CreateStockAdjustmentRequest request, AppUser actor) {
        if (request.quantityDelta() == null || request.quantityDelta() == 0) {
            throw new IllegalArgumentException("quantityDelta must not be zero");
        }
        AdjustmentType type = request.type() == null ? AdjustmentType.CORRECTION : request.type();
        Book book = bookRepository.findById(request.bookId()).orElseThrow(() -> new ResourceNotFoundException("book not found"));
        int previousQuantity = book.getStockQuantity();
        int nextQuantity = book.getStockQuantity() + request.quantityDelta();
        if (nextQuantity < 0) {
            throw new IllegalArgumentException("stock cannot be negative");
        }
        book.setStockQuantity(nextQuantity);
        if (previousQuantity <= 0 && nextQuantity > 0) {
            bookRequestRepository.findByBookAndStatus(book, BookRequestStatus.OPEN)
                    .forEach(bookRequest -> notificationService.create(bookRequest.getCustomer(), "Requested book restocked", book.getTitle() + " is back in stock. You can place an order now."));
        }
        AppUser adjustedBy = request.adjustedById() == null ? null : userRepository.findById(request.adjustedById()).orElseThrow(() -> new ResourceNotFoundException("user not found"));
        StockAdjustment adjustment = new StockAdjustment(book, adjustedBy, type, request.quantityDelta(), request.note());
        StockAdjustment saved = adjustmentRepository.save(adjustment);
        auditService.record(actor, "STOCK_ADJUSTED", "BOOK", book.getId(), "Adjusted " + book.getTitle() + " by " + request.quantityDelta() + " unit(s)");
        return StockAdjustmentDto.from(saved);
    }
}
