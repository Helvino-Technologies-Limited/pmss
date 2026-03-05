package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, UUID> {
    List<Purchase> findByTenantIdOrderByPurchaseDateDesc(UUID tenantId);
    List<Purchase> findByTenantIdAndStatus(UUID tenantId, String status);
}
