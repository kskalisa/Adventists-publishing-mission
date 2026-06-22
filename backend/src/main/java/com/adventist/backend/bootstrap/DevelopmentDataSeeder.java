package com.adventist.backend.bootstrap;

import com.adventist.backend.books.Book;
import com.adventist.backend.books.BookRepository;
import com.adventist.backend.customers.Customer;
import com.adventist.backend.customers.CustomerRepository;
import com.adventist.backend.customers.CustomerType;
import com.adventist.backend.sales.Sale;
import com.adventist.backend.sales.SaleItem;
import com.adventist.backend.sales.SaleRepository;
import com.adventist.backend.sales.SaleStatus;
import com.adventist.backend.users.AppUser;
import com.adventist.backend.users.AppUserRepository;
import com.adventist.backend.users.UserRole;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DevelopmentDataSeeder {
    @Bean
    CommandLineRunner seedData(SeedService seedService) {
        return args -> seedService.seed();
    }

    @Configuration
    static class SeedService {
        private final AppUserRepository userRepository;
        private final BookRepository bookRepository;
        private final CustomerRepository customerRepository;
        private final SaleRepository saleRepository;
        private final PasswordEncoder passwordEncoder;

        SeedService(AppUserRepository userRepository, BookRepository bookRepository, CustomerRepository customerRepository, SaleRepository saleRepository, PasswordEncoder passwordEncoder) {
            this.userRepository = userRepository;
            this.bookRepository = bookRepository;
            this.customerRepository = customerRepository;
            this.saleRepository = saleRepository;
            this.passwordEncoder = passwordEncoder;
        }

        @Transactional
        void seed() {
            if (userRepository.count() > 0 || bookRepository.count() > 0 || customerRepository.count() > 0) {
                return;
            }

            List<AppUser> users = userRepository.saveAll(List.of(
                    new AppUser("Moise Arihafi", "admin@adventist.rw", UserRole.ADMIN, passwordEncoder.encode("admin123")),
                    new AppUser("Jean-Claude N.", "sales@adventist.rw", UserRole.SALES, passwordEncoder.encode("sales123")),
                    new AppUser("Sarah Uwase", "inventory@adventist.rw", UserRole.INVENTORY_MANAGER, passwordEncoder.encode("inventory123")),
                    new AppUser("Eric Manzi", "coordinator@adventist.rw", UserRole.COORDINATOR, passwordEncoder.encode("coordinator123"))
            ));

            List<Book> books = bookRepository.saveAll(List.of(
                    new Book("The Great Controversy", "Ellen G. White", "978-0-8163-2345", "Spirituality", new BigDecimal("18.50"), 1240, 50),
                    new Book("Ministry of Healing", "Health Dept.", "978-0-8163-1122", "Health & Wellness", new BigDecimal("14.99"), 42, 50),
                    new Book("Steps to Christ", "Ellen G. White", "978-0-8163-9988", "Spirituality", new BigDecimal("5.00"), 850, 50),
                    new Book("SDA Hymnal (Hardcover)", "Adventist Publishing", "978-0-8280-0001", "Hymnal", new BigDecimal("30.00"), 320, 30),
                    new Book("Quarterly Lesson", "Sabbath School", "978-0-8280-0002", "Education", new BigDecimal("3.00"), 18, 40)
            ));

            List<Customer> customers = customerRepository.saveAll(List.of(
                    new Customer("Jean-Claude M.", CustomerType.BRANCH, "jean.claude@adventist.rw", "+250788000001", "Kigali Center"),
                    new Customer("Butare SDA Church", CustomerType.CHURCH, "butare@adventist.rw", "+250788000002", "Huye District"),
                    new Customer("Gitwe Adventist College", CustomerType.SCHOOL, "gitwe@adventist.rw", "+250788000003", "Ruhango")
            ));

            Sale sale = new Sale(customers.get(0), users.get(1), SaleStatus.PAID, BigDecimal.ZERO);
            sale.addItem(new SaleItem(books.get(0), 2, books.get(0).getPrice()));
            sale.addItem(new SaleItem(books.get(2), 4, books.get(2).getPrice()));
            books.get(0).setStockQuantity(books.get(0).getStockQuantity() - 2);
            books.get(2).setStockQuantity(books.get(2).getStockQuantity() - 4);
            sale.recalculate();
            saleRepository.save(sale);
        }
    }
}
