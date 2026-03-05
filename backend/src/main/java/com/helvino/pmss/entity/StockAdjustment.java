package com.helvino.pmss.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_adjustments")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class StockAdjustment {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "adjusted_by")
    private UUID adjustedBy;

    @Column(name = "adjustment_type", nullable = false)
    private String adjustmentType;

    @Column(name = "quantity_before", nullable = false)
    private Integer quantityBefore;

    @Column(name = "quantity_adjusted", nullable = false)
    private Integer quantityAdjusted;

    @Column(name = "quantity_after", nullable = false)
    private Integer quantityAfter;

    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
