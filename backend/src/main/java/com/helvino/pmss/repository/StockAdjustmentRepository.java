package com.helvino.pmss.repository;

import com.helvino.pmss.entity.StockAdjustment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StockAdjustmentRepository extends JpaRepository<StockAdjustment, UUID> {
    List<StockAdjustment> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<StockAdjustment> findByTenantIdAndProductId(UUID tenantId, UUID productId);
}
