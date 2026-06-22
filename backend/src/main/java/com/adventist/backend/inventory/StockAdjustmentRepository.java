package com.adventist.backend.inventory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, Long> {
    @EntityGraph(attributePaths = {"book", "adjustedBy"})
    List<StockAdjustment> findTop20ByOrderByCreatedAtDesc();
}
