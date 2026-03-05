package com.helvino.pmss.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "products")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "category_id")
    private UUID categoryId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "drug_name", nullable = false)
    private String drugName;

    @Column(name = "generic_name")
    private String genericName;

    @Column(name = "brand_name")
    private String brandName;

    private String barcode;

    @Builder.Default
    @Column(name = "product_type")
    private String productType = "OTC";

    @Column(name = "dosage_form")
    private String dosageForm;

    private String strength;

    @Builder.Default
    @Column(name = "unit_of_measure")
    private String unitOfMeasure = "Piece";

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "manufacture_date")
    private LocalDate manufactureDate;

    @Builder.Default
    @Column(name = "cost_price", nullable = false)
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "selling_price", nullable = false)
    private BigDecimal sellingPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "vat_percent")
    private BigDecimal vatPercent = BigDecimal.ZERO;

    @Builder.Default
    private Integer quantity = 0;

    @Builder.Default
    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;

    @Column(name = "storage_location")
    private String storageLocation;

    private String description;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
