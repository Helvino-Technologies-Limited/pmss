package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Customer;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;

    private UUID tenantId() { return UUID.fromString(TenantContext.getCurrentTenant()); }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Customers", customerRepository.findByTenantId(tenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> getById(@PathVariable UUID id) {
        Customer c = customerRepository.findById(id)
            .filter(cu -> cu.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return ResponseEntity.ok(ApiResponse.ok("Customer", c));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Customer>>> search(@RequestParam String q) {
        return ResponseEntity.ok(ApiResponse.ok("Results", customerRepository.searchCustomers(tenantId(), q)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> create(@RequestBody Customer customer) {
        customer.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Customer created", customerRepository.save(customer)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> update(@PathVariable UUID id, @RequestBody Customer request) {
        Customer c = customerRepository.findById(id)
            .filter(cu -> cu.getTenantId().equals(tenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        request.setId(id);
        request.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Customer updated", customerRepository.save(request)));
    }
}
