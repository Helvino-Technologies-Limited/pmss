package com.helvino.pmss.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchases")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Purchase {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false)
    private UUID tenantId;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "received_by")
    private UUID receivedBy;

    @Column(name = "po_number")
    private String poNumber;

    @Column(name = "invoice_number")
    private String invoiceNumber;

    @Column(name = "purchase_date")
    private LocalDateTime purchaseDate;

    @Column(name = "expected_date")
    private LocalDate expectedDate;

    @Column(name = "received_date")
    private LocalDateTime receivedDate;

    @Builder.Default private BigDecimal subtotal = BigDecimal.ZERO;
    @Builder.Default @Column(name = "vat_amount") private BigDecimal vatAmount = BigDecimal.ZERO;
    @Builder.Default @Column(name = "total_amount") private BigDecimal totalAmount = BigDecimal.ZERO;
    @Builder.Default @Column(name = "amount_paid") private BigDecimal amountPaid = BigDecimal.ZERO;
    @Builder.Default @Column(name = "balance_due") private BigDecimal balanceDue = BigDecimal.ZERO;

    @Builder.Default @Column(name = "payment_status") private String paymentStatus = "UNPAID";
    @Builder.Default private String status = "PENDING";

    private String notes;

    @JsonIgnore
    @Builder.Default
    @OneToMany(mappedBy = "purchase", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PurchaseItem> items = new ArrayList<>();

    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;
}
