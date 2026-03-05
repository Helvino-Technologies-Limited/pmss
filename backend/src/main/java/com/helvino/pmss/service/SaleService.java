package com.helvino.pmss.service;

import com.helvino.pmss.dto.request.SaleRequest;
import com.helvino.pmss.entity.Product;
import com.helvino.pmss.entity.Sale;
import com.helvino.pmss.entity.SaleItem;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.ProductRepository;
import com.helvino.pmss.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public List<Sale> getAll(UUID tenantId) {
        return saleRepository.findByTenantIdOrderBySaleDateDesc(tenantId);
    }

    public Sale getById(UUID tenantId, UUID saleId) {
        return saleRepository.findById(saleId)
            .filter(s -> s.getTenantId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
    }

    @Transactional
    public Sale createSale(UUID tenantId, UUID userId, SaleRequest req) {
        List<SaleItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalVat = BigDecimal.ZERO;

        for (SaleRequest.SaleItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.getProductId()));

            if (product.getQuantity() < itemReq.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for: " + product.getDrugName());
            }

            BigDecimal lineTotal = itemReq.getUnitPrice()
                .multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            BigDecimal discount = itemReq.getDiscountPercent() != null
                ? lineTotal.multiply(itemReq.getDiscountPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

            lineTotal = lineTotal.subtract(discount);

            BigDecimal vatAmount = product.getVatPercent() != null && product.getVatPercent().compareTo(BigDecimal.ZERO) > 0
                ? lineTotal.multiply(product.getVatPercent()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

            subtotal = subtotal.add(lineTotal);
            totalVat = totalVat.add(vatAmount);

            SaleItem item = SaleItem.builder()
                .productId(product.getId())
                .quantity(itemReq.getQuantity())
                .unitPrice(itemReq.getUnitPrice())
                .discountPercent(itemReq.getDiscountPercent() != null ? itemReq.getDiscountPercent() : BigDecimal.ZERO)
                .vatPercent(product.getVatPercent() != null ? product.getVatPercent() : BigDecimal.ZERO)
                .vatAmount(vatAmount)
                .lineTotal(lineTotal.add(vatAmount))
                .build();

            items.add(item);

            // Deduct stock
            product.setQuantity(product.getQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        BigDecimal discountAmount = req.getDiscountAmount() != null ? req.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal totalAmount = subtotal.add(totalVat).subtract(discountAmount);
        BigDecimal amountPaid = req.getAmountPaid() != null ? req.getAmountPaid() : totalAmount;
        BigDecimal change = amountPaid.subtract(totalAmount).max(BigDecimal.ZERO);
        BigDecimal balanceDue = totalAmount.subtract(amountPaid).max(BigDecimal.ZERO);

        String paymentStatus = balanceDue.compareTo(BigDecimal.ZERO) > 0 ? "CREDIT" : "PAID";

        Sale sale = Sale.builder()
            .tenantId(tenantId)
            .customerId(req.getCustomerId())
            .prescriptionId(req.getPrescriptionId())
            .servedBy(userId)
            .invoiceNumber(generateInvoiceNumber(tenantId))
            .saleDate(LocalDateTime.now())
            .subtotal(subtotal)
            .discountAmount(discountAmount)
            .vatAmount(totalVat)
            .totalAmount(totalAmount)
            .amountPaid(amountPaid)
            .changeGiven(change)
            .balanceDue(balanceDue)
            .paymentMethod(req.getPaymentMethod() != null ? req.getPaymentMethod() : "CASH")
            .paymentStatus(paymentStatus)
            .insuranceProvider(req.getInsuranceProvider())
            .insuranceClaimNumber(req.getInsuranceClaimNumber())
            .notes(req.getNotes())
            .items(items)
            .build();

        items.forEach(item -> item.setSale(sale));

        return saleRepository.save(sale);
    }

    @Transactional
    public Sale voidSale(UUID tenantId, UUID saleId) {
        Sale sale = getById(tenantId, saleId);
        if (sale.getIsVoid()) throw new IllegalStateException("Sale already voided");

        // Restore stock
        for (SaleItem item : sale.getItems()) {
            productRepository.findById(item.getProductId()).ifPresent(p -> {
                p.setQuantity(p.getQuantity() + item.getQuantity());
                productRepository.save(p);
            });
        }
        sale.setIsVoid(true);
        return saleRepository.save(sale);
    }

    private String generateInvoiceNumber(UUID tenantId) {
        String prefix = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = saleRepository.countSalesBetween(
            tenantId,
            LocalDateTime.now().withHour(0).withMinute(0),
            LocalDateTime.now()
        );
        return prefix + "-" + String.format("%04d", count + 1);
    }
}
