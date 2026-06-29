package com.adventist.backend.bookrequests;

import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.notifications.NotificationService;
import com.adventist.backend.users.AppUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookRequestService {
    private final BookRequestRepository requestRepository;
    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;
    private final NotificationService notificationService;

    public BookRequestService(BookRequestRepository requestRepository, BookRepository bookRepository, CustomerRepository customerRepository, NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.bookRepository = bookRepository;
        this.customerRepository = customerRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookRequestDto create(CreateBookRequestInterest request, AppUser user) {
        Customer customer = customerRepository.findByEmailIgnoreCase(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("customer profile not found"));
        Book book = bookRepository.findById(request.bookId()).orElseThrow(() -> new ResourceNotFoundException("book not found"));
        int quantity = request.quantity() == null ? 1 : request.quantity();
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity must be greater than zero");
        }
        BookRequest saved = requestRepository.save(new BookRequest(book, customer, quantity, clean(request.comment())));
        notificationService.create(customer, "Book request submitted", "We recorded your request for " + book.getTitle() + ".");
        return BookRequestDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<BookRequestDto> listMine(AppUser user) {
        Customer customer = customerRepository.findByEmailIgnoreCase(user.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("customer profile not found"));
        return requestRepository.findByCustomerOrderByCreatedAtDesc(customer).stream().map(BookRequestDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookRequestDto> listAll() {
        return requestRepository.findAllByOrderByCreatedAtDesc().stream().map(BookRequestDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BookRequestSummaryDto> summarizeOpenRequests() {
        return requestRepository.summarizeOpenRequests();
    }

    @Transactional
    public BookRequestDto updateStatus(Long id, UpdateBookRequestStatus request) {
        BookRequest bookRequest = requestRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("book request not found"));
        bookRequest.setStatus(request.status());
        if (request.status() == BookRequestStatus.FULFILLED) {
            notificationService.create(bookRequest.getCustomer(), "Requested book is available", bookRequest.getBook().getTitle() + " has been marked as available for follow-up.");
        }
        return BookRequestDto.from(bookRequest);
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
