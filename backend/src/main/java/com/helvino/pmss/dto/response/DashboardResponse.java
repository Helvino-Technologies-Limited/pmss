package com.helvino.pmss.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardResponse {
    private BigDecimal todaySales;
    private BigDecimal monthlySales;
    private BigDecimal grossProfit;
    private Long todayTransactions;
    private Integer lowStockCount;
    private Integer outOfStockCount;
    private Integer expiringCount;
    private BigDecimal creditOutstanding;
    private BigDecimal monthlyExpenses;
    private BigDecimal netProfit;
    private List<Map<String, Object>> topSellingProducts;
    private List<Map<String, Object>> recentSales;
    private List<Map<String, Object>> expiringProducts;
    private List<Map<String, Object>> lowStockProducts;
    private List<Map<String, Object>> salesChartData;
}
