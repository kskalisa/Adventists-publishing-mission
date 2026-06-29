package com.adventist.backend.inventory;

import com.adventist.backend.users.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    StockAdjustmentDto createAdjustment(@RequestBody CreateStockAdjustmentRequest request, @AuthenticationPrincipal AppUser user) {
        return service.createAdjustment(request, user);
    }
}
