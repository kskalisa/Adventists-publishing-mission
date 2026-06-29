package com.adventist.backend.customers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    @Query("""
            select c from Customer c
            where lower(c.name) like lower(concat('%', :term, '%'))
               or lower(coalesce(c.email, '')) like lower(concat('%', :term, '%'))
               or lower(coalesce(c.district, '')) like lower(concat('%', :term, '%'))
               or lower(coalesce(c.address, '')) like lower(concat('%', :term, '%'))
            order by c.name
            """)
    List<Customer> search(String term);

    Optional<Customer> findByEmailIgnoreCase(String email);
}
