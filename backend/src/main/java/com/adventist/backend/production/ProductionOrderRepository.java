package com.adventist.backend.production;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {
    List<ProductionOrder> findAllByOrderByCreatedAtDesc();
}
