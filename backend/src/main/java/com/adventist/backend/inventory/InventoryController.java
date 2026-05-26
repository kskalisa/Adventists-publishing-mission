package com.adventist.backend.inventory;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {
    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping("/adjustments")
    List<StockAdjustmentDto> listRecentAdjustments() {
        return service.listRecentAdjustments();
    }

    @PostMapping("/adjustments")
    @ResponseStatus(HttpStatus.CREATED)
    StockAdjustmentDto createAdjustment(@RequestBody CreateStockAdjustmentRequest request) {
        return service.createAdjustment(request);
    }
}
