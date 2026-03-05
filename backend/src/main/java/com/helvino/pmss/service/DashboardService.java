package com.helvino.pmss.service;

import com.helvino.pmss.dto.response.DashboardResponse;
import com.helvino.pmss.entity.Product;
import com.helvino.pmss.entity.Sale;
import com.helvino.pmss.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;
    private final ExpenseRepository expenseRepository;
    private final CustomerRepository customerRepository;

    public DashboardResponse getDashboard(UUID tenantId) {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = LocalDate.now().atTime(23, 59, 59);
        LocalDateTime monthStart = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        BigDecimal todaySales = saleRepository.sumSalesBetween(tenantId, todayStart, todayEnd);
        BigDecimal monthlySales = saleRepository.sumSalesBetween(tenantId, monthStart, todayEnd);
        Long todayTxns = saleRepository.countSalesBetween(tenantId, todayStart, todayEnd);
        BigDecimal monthlyExpenses = expenseRepository.sumExpensesBetween(
            tenantId, LocalDate.now().withDayOfMonth(1), LocalDate.now());

        List<Product> allProducts = productRepository.findByTenantIdAndIsActiveTrue(tenantId);
        List<Product> lowStock = productRepository.findLowStockProducts(tenantId);
        List<Product> outOfStock = productRepository.findOutOfStockProducts(tenantId);
        List<Product> expiring = productRepository.findExpiringProducts(tenantId, LocalDate.now().plusDays(90));

        List<Sale> creditSales = saleRepository.findCreditSales(tenantId);
        BigDecimal creditOutstanding = creditSales.stream()
            .map(Sale::getBalanceDue)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Cost of goods sold for gross profit
        List<Sale> monthlySalesList = saleRepository.findByTenantIdAndSaleDateBetweenOrderBySaleDateDesc(
            tenantId, monthStart, todayEnd);

        BigDecimal grossProfit = monthlySalesList.stream()
            .filter(s -> !s.getIsVoid())
            .map(s -> s.getTotalAmount().subtract(s.getSubtotal().multiply(BigDecimal.valueOf(0.6))))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = grossProfit.subtract(monthlyExpenses);

        // Sales chart - last 7 days
        List<Map<String, Object>> chartData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            BigDecimal dayTotal = saleRepository.sumSalesBetween(
                tenantId, day.atStartOfDay(), day.atTime(23, 59, 59));
            Map<String, Object> point = new HashMap<>();
            point.put("date", day.toString());
            point.put("sales", dayTotal);
            chartData.add(point);
        }

        // Expiring products summary
        List<Map<String, Object>> expiringList = expiring.stream().limit(5).map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getDrugName());
            m.put("expiryDate", p.getExpiryDate());
            m.put("quantity", p.getQuantity());
            return m;
        }).collect(Collectors.toList());

        // Low stock summary
        List<Map<String, Object>> lowStockList = lowStock.stream().limit(5).map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getDrugName());
            m.put("quantity", p.getQuantity());
            m.put("reorderLevel", p.getReorderLevel());
            return m;
        }).collect(Collectors.toList());

        // Recent sales
        List<Map<String, Object>> recentSales = monthlySalesList.stream().limit(5).map(s -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", s.getId());
            m.put("invoiceNumber", s.getInvoiceNumber());
            m.put("total", s.getTotalAmount());
            m.put("paymentMethod", s.getPaymentMethod());
            m.put("date", s.getSaleDate());
            return m;
        }).collect(Collectors.toList());

        return DashboardResponse.builder()
            .todaySales(todaySales)
            .monthlySales(monthlySales)
            .grossProfit(grossProfit.setScale(2, RoundingMode.HALF_UP))
            .netProfit(netProfit.setScale(2, RoundingMode.HALF_UP))
            .todayTransactions(todayTxns)
            .lowStockCount(lowStock.size())
            .outOfStockCount(outOfStock.size())
            .expiringCount(expiring.size())
            .creditOutstanding(creditOutstanding)
            .monthlyExpenses(monthlyExpenses)
            .topSellingProducts(new ArrayList<>())
            .recentSales(recentSales)
            .expiringProducts(expiringList)
            .lowStockProducts(lowStockList)
            .salesChartData(chartData)
            .build();
    }
}
