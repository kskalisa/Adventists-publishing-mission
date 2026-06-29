package com.adventist.backend.bookrequests;

public record CreateBookRequestInterest(Long bookId, Integer quantity, String comment) {
}
