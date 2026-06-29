package com.adventist.backend.sales;

import com.adventist.backend.users.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @GetMapping("/my")
    List<SaleDto> listCustomerSales(@AuthenticationPrincipal AppUser user) {
        return service.listCustomerSales(user);
    }

    @GetMapping("/{id}")
    SaleDto getSale(@PathVariable Long id) {
        return service.getSale(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    SaleDto createSale(@RequestBody CreateSaleRequest request, @AuthenticationPrincipal AppUser user) {
        return service.createSale(request, user);
    }

    @PutMapping("/my/{id}")
    SaleDto updateMyOrder(@PathVariable Long id, @RequestBody UpdateSaleRequest request, @AuthenticationPrincipal AppUser user) {
        return service.updateOrder(id, request, user);
    }

    @PostMapping("/my/{id}/cancel")
    SaleDto cancelMyOrder(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.cancelOrder(id, user);
    }

    @DeleteMapping("/my/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void hideMyOrder(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        service.hideCustomerOrder(id, user);
    }

    @PutMapping("/{id}/status")
    SaleDto updateOrderStatus(@PathVariable Long id, @RequestBody UpdateSaleRequest request, @AuthenticationPrincipal AppUser user) {
        return service.updateOrderStatus(id, request, user);
    }
}
