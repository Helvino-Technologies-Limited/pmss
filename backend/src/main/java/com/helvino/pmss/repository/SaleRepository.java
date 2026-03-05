package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SaleRepository extends JpaRepository<Sale, UUID> {
    List<Sale> findByTenantIdOrderBySaleDateDesc(UUID tenantId);

    @Query("SELECT COALESCE(SUM(s.totalAmount),0) FROM Sale s WHERE s.tenantId = :tenantId AND s.saleDate >= :from AND s.saleDate <= :to AND s.isVoid = false")
    BigDecimal sumSalesBetween(UUID tenantId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.tenantId = :tenantId AND s.saleDate >= :from AND s.saleDate <= :to AND s.isVoid = false")
    Long countSalesBetween(UUID tenantId, LocalDateTime from, LocalDateTime to);

    List<Sale> findByTenantIdAndSaleDateBetweenOrderBySaleDateDesc(UUID tenantId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT s FROM Sale s WHERE s.tenantId = :tenantId AND s.paymentStatus = 'CREDIT' ORDER BY s.saleDate DESC")
    List<Sale> findCreditSales(UUID tenantId);

    String findTopByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
