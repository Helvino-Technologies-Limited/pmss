package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Prescription;
import com.helvino.pmss.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionRepository prescriptionRepository;

    private UUID tenantId() { return UUID.fromString(TenantContext.getCurrentTenant()); }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Prescription>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Prescriptions",
            prescriptionRepository.findByTenantIdOrderByCreatedAtDesc(tenantId())));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<Prescription>>> getByCustomer(@PathVariable UUID customerId) {
        return ResponseEntity.ok(ApiResponse.ok("Prescriptions",
            prescriptionRepository.findByTenantIdAndCustomerId(tenantId(), customerId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Prescription>> create(@RequestBody Prescription prescription) {
        prescription.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Prescription saved", prescriptionRepository.save(prescription)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Prescription>> updateStatus(
            @PathVariable UUID id,
            @RequestBody java.util.Map<String, String> body) {
        Prescription p = prescriptionRepository.findById(id)
            .filter(rx -> rx.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new com.helvino.pmss.exception.ResourceNotFoundException("Prescription not found"));
        p.setStatus(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("Status updated", prescriptionRepository.save(p)));
    }
}
