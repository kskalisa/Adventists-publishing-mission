package com.adventist.backend.books;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {
    boolean existsByIsbn(String isbn);

    @Query("""
            select b from Book b
            where lower(b.title) like lower(concat('%', :term, '%'))
               or lower(b.author) like lower(concat('%', :term, '%'))
               or lower(b.isbn) like lower(concat('%', :term, '%'))
            order by b.title
            """)
    List<Book> search(String term);

    List<Book> findTop8ByOrderByStockQuantityAsc();
}
