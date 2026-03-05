package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByTenantId(UUID tenantId);
    List<Product> findByTenantIdAndIsActiveTrue(UUID tenantId);
    Optional<Product> findByTenantIdAndBarcode(UUID tenantId, String barcode);

    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId AND p.expiryDate <= :date AND p.isActive = true")
    List<Product> findExpiringProducts(UUID tenantId, LocalDate date);

    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId AND p.quantity <= p.reorderLevel AND p.isActive = true")
    List<Product> findLowStockProducts(UUID tenantId);

    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId AND p.quantity = 0 AND p.isActive = true")
    List<Product> findOutOfStockProducts(UUID tenantId);

    @Query("SELECT p FROM Product p WHERE p.tenantId = :tenantId AND (LOWER(p.drugName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(p.genericName) LIKE LOWER(CONCAT('%',:q,'%')) OR p.barcode = :q)")
    List<Product> searchProducts(UUID tenantId, String q);
}
