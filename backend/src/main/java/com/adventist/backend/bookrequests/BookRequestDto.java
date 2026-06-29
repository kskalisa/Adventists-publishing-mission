package com.adventist.backend.bookrequests;

import java.time.Instant;

public record BookRequestDto(
        Long id,
        Long bookId,
        String bookTitle,
        Long customerId,
        String customerName,
        int quantity,
        String comment,
        BookRequestStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static BookRequestDto from(BookRequest request) {
        return new BookRequestDto(
                request.getId(),
                request.getBook().getId(),
                request.getBook().getTitle(),
                request.getCustomer().getId(),
                request.getCustomer().getName(),
                request.getQuantity(),
                request.getComment(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
}
