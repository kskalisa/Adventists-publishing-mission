package com.adventist.backend.dashboard;

import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookDto;
import com.adventist.backend.books.BookStatus;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.sales.SaleDto;
import com.adventist.backend.sales.SaleRepository;
import com.adventist.backend.users.AppUserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class DashboardService {
    private final AppUserRepository userRepository;
    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public DashboardService(AppUserRepository userRepository, BookRepository bookRepository, CustomerRepository customerRepository, SaleRepository saleRepository) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
    }

    public DashboardSummary summary() {
        List<Book> books = bookRepository.findAll();
        long lowStockCount = books.stream().filter(book -> book.getStatus() == BookStatus.LOW_STOCK).count();
        long outOfStockCount = books.stream().filter(book -> book.getStatus() == BookStatus.OUT_OF_STOCK).count();
        return new DashboardSummary(
                userRepository.count(),
                bookRepository.count(),
                customerRepository.count(),
                saleRepository.totalRevenue(),
                saleRepository.revenueSince(Instant.now().minus(30, ChronoUnit.DAYS)),
                lowStockCount,
                outOfStockCount,
                bookRepository.findTop8ByOrderByStockQuantityAsc().stream().map(BookDto::from).toList(),
                saleRepository.findTop10ByOrderByCreatedAtDesc().stream().map(SaleDto::from).toList()
        );
    }
}
