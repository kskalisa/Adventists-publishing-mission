package com.adventist.backend.inventory;

import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.common.ResourceNotFoundException;
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

    public InventoryService(StockAdjustmentRepository adjustmentRepository, BookRepository bookRepository, AppUserRepository userRepository) {
        this.adjustmentRepository = adjustmentRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<StockAdjustmentDto> listRecentAdjustments() {
        return adjustmentRepository.findTop20ByOrderByCreatedAtDesc().stream().map(StockAdjustmentDto::from).toList();
    }

    @Transactional
    public StockAdjustmentDto createAdjustment(CreateStockAdjustmentRequest request) {
        if (request.quantityDelta() == null || request.quantityDelta() == 0) {
            throw new IllegalArgumentException("quantityDelta must not be zero");
        }
        AdjustmentType type = request.type() == null ? AdjustmentType.CORRECTION : request.type();
        Book book = bookRepository.findById(request.bookId()).orElseThrow(() -> new ResourceNotFoundException("book not found"));
        int nextQuantity = book.getStockQuantity() + request.quantityDelta();
        if (nextQuantity < 0) {
            throw new IllegalArgumentException("stock cannot be negative");
        }
        book.setStockQuantity(nextQuantity);
        AppUser adjustedBy = request.adjustedById() == null ? null : userRepository.findById(request.adjustedById()).orElseThrow(() -> new ResourceNotFoundException("user not found"));
        StockAdjustment adjustment = new StockAdjustment(book, adjustedBy, type, request.quantityDelta(), request.note());
        return StockAdjustmentDto.from(adjustmentRepository.save(adjustment));
    }
}
