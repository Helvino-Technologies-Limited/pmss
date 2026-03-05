package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Product;
import com.helvino.pmss.entity.StockAdjustment;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.ProductRepository;
import com.helvino.pmss.repository.StockAdjustmentRepository;
import com.helvino.pmss.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/stock-adjustments")
@RequiredArgsConstructor
public class StockAdjustmentController {

    private final StockAdjustmentRepository adjustmentRepository;
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
    public ResponseEntity<ApiResponse<List<StockAdjustment>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Adjustments",
            adjustmentRepository.findByTenantIdOrderByCreatedAtDesc(tenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<StockAdjustment>> adjust(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        UUID productId = UUID.fromString(body.get("productId").toString());
        int quantity = Integer.parseInt(body.get("quantity").toString());
        String type = body.get("adjustmentType").toString();
        String reason = body.getOrDefault("reason", "").toString();

        Product product = productRepository.findById(productId)
            .filter(p -> p.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        int before = product.getQuantity();
        int after;

        switch (type) {
            case "DAMAGE":
            case "EXPIRED":
            case "THEFT":
            case "TRANSFER_OUT":
                after = Math.max(0, before - quantity);
                break;
            case "CORRECTION":
                after = quantity;
                break;
            case "TRANSFER_IN":
            default:
                after = before + quantity;
                break;
        }

        product.setQuantity(after);
        productRepository.save(product);

        StockAdjustment adj = StockAdjustment.builder()
            .tenantId(tenantId())
            .productId(productId)
            .adjustedBy(userId(request))
            .adjustmentType(type)
            .quantityBefore(before)
            .quantityAdjusted(quantity)
            .quantityAfter(after)
            .reason(reason)
            .build();

        return ResponseEntity.ok(ApiResponse.ok("Stock adjusted", adjustmentRepository.save(adj)));
    }
}
