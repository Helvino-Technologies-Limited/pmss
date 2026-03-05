package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Sale;
import com.helvino.pmss.entity.Expense;
import com.helvino.pmss.repository.ExpenseRepository;
import com.helvino.pmss.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final SaleRepository saleRepository;
    private final ExpenseRepository expenseRepository;

    private UUID tenantId() {
        return UUID.fromString(TenantContext.getCurrentTenant());
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Map<String, Object>>> salesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        UUID tenantId = tenantId();
        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt = to.atTime(23, 59, 59);

        List<Sale> sales = saleRepository
            .findByTenantIdAndSaleDateBetweenOrderBySaleDateDesc(tenantId, fromDt, toDt);

        BigDecimal totalSales = saleRepository.sumSalesBetween(tenantId, fromDt, toDt);
        Long count = saleRepository.countSalesBetween(tenantId, fromDt, toDt);

        BigDecimal totalExpenses = expenseRepository.sumExpensesBetween(tenantId, from, to);
        BigDecimal netProfit = totalSales.subtract(totalExpenses);

        Map<String, Object> report = new HashMap<>();
        report.put("sales", sales);
        report.put("totalSales", totalSales);
        report.put("transactionCount", count);
        report.put("totalExpenses", totalExpenses);
        report.put("netProfit", netProfit);
        report.put("from", from);
        report.put("to", to);

        return ResponseEntity.ok(ApiResponse.ok("Sales report", report));
    }

    @GetMapping("/expenses")
    public ResponseEntity<ApiResponse<Map<String, Object>>> expensesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        UUID tenantId = tenantId();

        List<Expense> expenses = expenseRepository.findByTenantIdOrderByExpenseDateDesc(tenantId);
        BigDecimal total = expenseRepository.sumExpensesBetween(tenantId, from, to);

        Map<String, Object> report = new HashMap<>();
        report.put("expenses", expenses);
        report.put("total", total);
        report.put("from", from);
        report.put("to", to);

        return ResponseEntity.ok(ApiResponse.ok("Expense report", report));
    }
}
