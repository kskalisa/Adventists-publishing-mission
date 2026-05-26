package com.adventist.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    List<StockAdjustment> findTop20ByOrderByCreatedAtDesc();
}
