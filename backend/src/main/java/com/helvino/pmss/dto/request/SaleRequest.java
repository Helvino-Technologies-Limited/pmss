package com.helvino.pmss.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SaleRequest {
    private UUID customerId;
    private UUID prescriptionId;
    @NotEmpty private List<SaleItemRequest> items;
    private BigDecimal discountAmount;
    private String paymentMethod;
    private BigDecimal amountPaid;
    private String insuranceProvider;
    private String insuranceClaimNumber;
    private String notes;

    @Data
    public static class SaleItemRequest {
        private UUID productId;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercent;
    }
}
