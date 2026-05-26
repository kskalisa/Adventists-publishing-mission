package com.adventist.backend.sales;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {
    private final SaleService service;

    public SaleController(SaleService service) {
        this.service = service;
    }

    @GetMapping
    List<SaleDto> listRecentSales() {
        return service.listRecentSales();
    }

    @GetMapping("/{id}")
    SaleDto getSale(@PathVariable Long id) {
        return service.getSale(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    SaleDto createSale(@RequestBody CreateSaleRequest request) {
        return service.createSale(request);
    }
}
