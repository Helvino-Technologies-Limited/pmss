package com.helvino.pmss.controller;

import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Tenant;
import com.helvino.pmss.service.TenantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/superadmin")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@RequiredArgsConstructor
public class SuperAdminController {

    private final TenantService tenantService;

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<List<Tenant>>> getAllTenants() {
        return ResponseEntity.ok(ApiResponse.ok("All tenants", tenantService.getAllTenants()));
    }

    @GetMapping("/tenants/{id}")
    public ResponseEntity<ApiResponse<Tenant>> getTenant(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Tenant", tenantService.getById(id)));
    }

    @PostMapping("/tenants/{id}/activate")
    public ResponseEntity<ApiResponse<Tenant>> activateSubscription(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        Tenant tenant = tenantService.activateSubscription(
            id,
            body.get("paymentMethod"),
            body.get("reference"),
            null,
            body.getOrDefault("paymentType", "SETUP")
        );
        return ResponseEntity.ok(ApiResponse.ok("Subscription activated", tenant));
    }

    @PostMapping("/tenants/{id}/toggle")
    public ResponseEntity<ApiResponse<Tenant>> toggleTenant(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(ApiResponse.ok("Tenant updated",
            tenantService.toggleTenant(id, body.get("active"))));
    }
}
