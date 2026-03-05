package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Product;
import com.helvino.pmss.entity.Purchase;
import com.helvino.pmss.entity.PurchaseItem;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.ProductRepository;
import com.helvino.pmss.repository.PurchaseRepository;
import com.helvino.pmss.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseRepository purchaseRepository;
    private final ProductRepository productRepository;
    private final JwtTokenProvider jwtTokenProvider;

    private UUID tenantId() {
        return UUID.fromString(TenantContext.getCurrentTenant());
    }

    private UUID userId(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            String uid = jwtTokenProvider.getUserIdFromToken(bearer.substring(7));
            return uid != null ? UUID.fromString(uid) : null;
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Purchase>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Purchases",
            purchaseRepository.findByTenantIdOrderByPurchaseDateDesc(tenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Purchase>> getById(@PathVariable UUID id) {
        Purchase p = purchaseRepository.findById(id)
            .filter(pu -> pu.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("Purchase not found"));
        return ResponseEntity.ok(ApiResponse.ok("Purchase", p));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Purchase>> create(@RequestBody Purchase purchase,
                                                         HttpServletRequest request) {
        purchase.setTenantId(tenantId());
        purchase.setReceivedBy(userId(request));
        purchase.setPurchaseDate(LocalDateTime.now());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal vatTotal = BigDecimal.ZERO;

        if (purchase.getItems() != null) {
            for (PurchaseItem item : purchase.getItems()) {
                item.setPurchase(purchase);
                BigDecimal lineTotal = item.getUnitCost()
                    .multiply(BigDecimal.valueOf(item.getQuantityOrdered()));
                item.setLineTotal(lineTotal);
                subtotal = subtotal.add(lineTotal);
            }
        }

        purchase.setSubtotal(subtotal);
        purchase.setTotalAmount(subtotal.add(vatTotal));
        purchase.setBalanceDue(purchase.getTotalAmount().subtract(purchase.getAmountPaid() != null ? purchase.getAmountPaid() : BigDecimal.ZERO));

        return ResponseEntity.ok(ApiResponse.ok("Purchase created", purchaseRepository.save(purchase)));
    }

    @PostMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<Purchase>> receivePurchase(@PathVariable UUID id) {
        Purchase purchase = purchaseRepository.findById(id)
            .filter(p -> p.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("Purchase not found"));

        if (purchase.getItems() != null) {
            for (PurchaseItem item : purchase.getItems()) {
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    product.setQuantity(product.getQuantity() + item.getQuantityOrdered());
                    if (item.getBatchNumber() != null) product.setBatchNumber(item.getBatchNumber());
                    if (item.getExpiryDate() != null) product.setExpiryDate(item.getExpiryDate());
                    productRepository.save(product);
                    item.setQuantityReceived(item.getQuantityOrdered());
                });
            }
        }

        purchase.setStatus("RECEIVED");
        purchase.setReceivedDate(LocalDateTime.now());
        return ResponseEntity.ok(ApiResponse.ok("Purchase received and stock updated",
            purchaseRepository.save(purchase)));
    }
}
