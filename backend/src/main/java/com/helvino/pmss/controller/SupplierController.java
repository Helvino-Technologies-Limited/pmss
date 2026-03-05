package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Supplier;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;

    private UUID tenantId() { return UUID.fromString(TenantContext.getCurrentTenant()); }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Supplier>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Suppliers", supplierRepository.findByTenantId(tenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Supplier>> create(@RequestBody Supplier supplier) {
        supplier.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Supplier created", supplierRepository.save(supplier)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Supplier>> update(@PathVariable UUID id, @RequestBody Supplier request) {
        Supplier s = supplierRepository.findById(id)
            .filter(sup -> sup.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        request.setId(id);
        request.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Supplier updated", supplierRepository.save(request)));
    }
}
