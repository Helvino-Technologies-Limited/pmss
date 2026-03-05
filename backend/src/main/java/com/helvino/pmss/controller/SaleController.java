package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.request.SaleRequest;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Sale;
import com.helvino.pmss.security.JwtTokenProvider;
import com.helvino.pmss.service.SaleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;
    private final JwtTokenProvider jwtTokenProvider;

    private UUID tenantId() {
        return UUID.fromString(TenantContext.getCurrentTenant());
    }

    private UUID userId(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            String userId = jwtTokenProvider.getUserIdFromToken(bearer.substring(7));
            return UUID.fromString(userId);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sale>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Sales", saleService.getAll(tenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sale>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Sale", saleService.getById(tenantId(), id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sale>> create(@Valid @RequestBody SaleRequest request,
                                                     HttpServletRequest httpRequest) {
        Sale sale = saleService.createSale(tenantId(), userId(httpRequest), request);
        return ResponseEntity.ok(ApiResponse.ok("Sale created", sale));
    }

    @PostMapping("/{id}/void")
    public ResponseEntity<ApiResponse<Sale>> voidSale(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Sale voided", saleService.voidSale(tenantId(), id)));
    }
}
