package com.adventist.backend.sales;

import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.common.ResourceNotFoundException;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SaleService {
    private final SaleRepository saleRepository;
    private final BookRepository bookRepository;
    private final CustomerRepository customerRepository;
    private final AppUserRepository userRepository;

    public SaleService(SaleRepository saleRepository, BookRepository bookRepository, CustomerRepository customerRepository, AppUserRepository userRepository) {
        this.saleRepository = saleRepository;
        this.bookRepository = bookRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    public List<SaleDto> listRecentSales() {
        return saleRepository.findTop10ByOrderByCreatedAtDesc().stream().map(SaleDto::from).toList();
    }

    public SaleDto getSale(Long id) {
        return SaleDto.from(saleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("sale not found")));
    }

    @Transactional
    public SaleDto createSale(CreateSaleRequest request) {
        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("at least one sale item is required");
        }
        Customer customer = request.customerId() == null ? null : customerRepository.findById(request.customerId()).orElseThrow(() -> new ResourceNotFoundException("customer not found"));
        AppUser cashier = request.cashierId() == null ? null : userRepository.findById(request.cashierId()).orElseThrow(() -> new ResourceNotFoundException("cashier not found"));
        Sale sale = new Sale(customer, cashier, request.status(), request.discount());

        for (SaleItemRequest itemRequest : request.items()) {
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
        sale.recalculate();
        return SaleDto.from(saleRepository.save(sale));
    }
}
