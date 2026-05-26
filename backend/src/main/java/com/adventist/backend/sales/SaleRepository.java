package com.adventist.backend.sales;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface SaleRepository extends JpaRepository<Sale, Long> {
    List<Sale> findTop10ByOrderByCreatedAtDesc();

    @Query("select coalesce(sum(s.total), 0) from Sale s where s.status = com.adventist.backend.sales.SaleStatus.PAID")
    BigDecimal totalRevenue();

    @Query("select coalesce(sum(s.total), 0) from Sale s where s.status = com.adventist.backend.sales.SaleStatus.PAID and s.createdAt >= :from")
    BigDecimal revenueSince(@Param("from") Instant from);
}
