package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Expense;
import com.helvino.pmss.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseRepository expenseRepository;

    private UUID tenantId() { return UUID.fromString(TenantContext.getCurrentTenant()); }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Expense>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Expenses",
            expenseRepository.findByTenantIdOrderByExpenseDateDesc(tenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> create(@RequestBody Expense expense) {
        expense.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Expense recorded", expenseRepository.save(expense)));
    }
}
