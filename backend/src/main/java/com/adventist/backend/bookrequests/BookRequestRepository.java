package com.adventist.backend.bookrequests;

import com.adventist.backend.customers.Customer;
import com.adventist.backend.books.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookRequestRepository extends JpaRepository<BookRequest, Long> {
    List<BookRequest> findByCustomerOrderByCreatedAtDesc(Customer customer);

    List<BookRequest> findAllByOrderByCreatedAtDesc();

    List<BookRequest> findByBookAndStatus(Book book, BookRequestStatus status);

    @Query("""
            select new com.adventist.backend.bookrequests.BookRequestSummaryDto(
                br.book.id,
                br.book.title,
                count(distinct br.customer.id),
                coalesce(sum(br.quantity), 0)
            )
            from BookRequest br
            where br.status = com.adventist.backend.bookrequests.BookRequestStatus.OPEN
            group by br.book.id, br.book.title
            order by coalesce(sum(br.quantity), 0) desc
            """)
    List<BookRequestSummaryDto> summarizeOpenRequests();
}
