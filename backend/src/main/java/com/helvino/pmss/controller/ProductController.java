package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.request.ProductRequest;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Product;
import com.helvino.pmss.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    private UUID tenantId() {
        return UUID.fromString(TenantContext.getCurrentTenant());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Product>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Products", productService.getAll(tenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Product", productService.getById(tenantId(), id)));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<Product>> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(ApiResponse.ok("Product", productService.getByBarcode(tenantId(), barcode)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Product>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok("Search results", productService.search(tenantId(), q)));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<Product>>> getExpiring(@RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(ApiResponse.ok("Expiring products", productService.getExpiring(tenantId(), days)));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<Product>>> getLowStock() {
        return ResponseEntity.ok(ApiResponse.ok("Low stock", productService.getLowStock(tenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Product>> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product created", productService.create(tenantId(), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Product>> update(@PathVariable UUID id,
                                                        @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Product updated", productService.update(tenantId(), id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        productService.delete(tenantId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Product deleted", null));
    }
}
