package com.helvino.pmss.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sales")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Sale {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(name = "prescription_id")
    private UUID prescriptionId;

    @Column(name = "served_by")
    private UUID servedBy;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

    @Column(name = "sale_date")
    private LocalDateTime saleDate;

    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_amount")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "vat_amount")
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_amount")
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "amount_paid")
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "change_given")
    private BigDecimal changeGiven = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "balance_due")
    private BigDecimal balanceDue = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "payment_method")
    private String paymentMethod = "CASH";

    @Builder.Default
    @Column(name = "payment_status")
    private String paymentStatus = "PAID";

    @Column(name = "insurance_provider")
    private String insuranceProvider;

    @Column(name = "insurance_claim_number")
    private String insuranceClaimNumber;

    private String notes;

    @Builder.Default
    @Column(name = "is_void")
    private Boolean isVoid = false;

    @Builder.Default
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SaleItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
