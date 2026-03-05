package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Prescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, UUID> {
    List<Prescription> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);
    List<Prescription> findByTenantIdAndCustomerId(UUID tenantId, UUID customerId);
    List<Prescription> findByTenantIdAndStatus(UUID tenantId, String status);
}
