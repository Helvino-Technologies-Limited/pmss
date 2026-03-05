package com.helvino.pmss.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "purchase_items")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PurchaseItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_id")
    private Purchase purchase;

    @Column(name = "product_id")
    private UUID productId;

    @Column(name = "quantity_ordered", nullable = false)
    private Integer quantityOrdered;

    @Builder.Default
    @Column(name = "quantity_received")
    private Integer quantityReceived = 0;

    @Column(name = "unit_cost", nullable = false)
    private BigDecimal unitCost;

    @Builder.Default @Column(name = "vat_percent") private BigDecimal vatPercent = BigDecimal.ZERO;
    @Builder.Default @Column(name = "vat_amount") private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "line_total", nullable = false)
    private BigDecimal lineTotal;

    @Column(name = "batch_number")
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;
}
