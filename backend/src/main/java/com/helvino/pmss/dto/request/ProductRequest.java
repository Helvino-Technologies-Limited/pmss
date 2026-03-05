package com.helvino.pmss.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class ProductRequest {
    @NotBlank private String drugName;
    private String genericName;
    private String brandName;
    private String barcode;
    private String productType;
    private String dosageForm;
    private String strength;
    private String unitOfMeasure;
    private String batchNumber;
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    @NotNull private BigDecimal costPrice;
    @NotNull private BigDecimal sellingPrice;
    private BigDecimal vatPercent;
    private Integer quantity;
    private Integer reorderLevel;
    private String storageLocation;
    private String description;
    private UUID categoryId;
    private UUID supplierId;
}
