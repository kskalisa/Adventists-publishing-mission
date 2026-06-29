package com.adventist.backend.production;

import com.adventist.backend.users.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production-orders")
public class ProductionOrderController {
    private final ProductionOrderService service;

    public ProductionOrderController(ProductionOrderService service) {
        this.service = service;
    }

    @GetMapping
    List<ProductionOrderDto> listOrders() {
        return service.listOrders();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ProductionOrderDto createOrder(@RequestBody CreateProductionOrderRequest request, @AuthenticationPrincipal AppUser user) {
        return service.createOrder(request, user);
    }

    @PutMapping("/{id}")
    ProductionOrderDto updateOrder(@PathVariable Long id, @RequestBody UpdateProductionOrderRequest request, @AuthenticationPrincipal AppUser user) {
        return service.updateOrder(id, request, user);
    }

    @PostMapping("/{id}/cancel")
    ProductionOrderDto cancelOrder(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        return service.cancelOrder(id, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void deleteOrder(@PathVariable Long id, @AuthenticationPrincipal AppUser user) {
        service.deleteOrder(id, user);
    }
}
