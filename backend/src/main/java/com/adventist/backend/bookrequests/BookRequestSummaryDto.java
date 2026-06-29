package com.adventist.backend.bookrequests;

public record BookRequestSummaryDto(Long bookId, String bookTitle, long customerCount, long requestedQuantity) {
}
