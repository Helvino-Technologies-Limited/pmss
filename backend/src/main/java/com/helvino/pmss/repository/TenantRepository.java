package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, UUID> {
    Optional<Tenant> findByEmail(String email);
    Optional<Tenant> findByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<Tenant> findBySubscriptionStatus(String status);
    List<Tenant> findByIsActiveTrue();
    List<Tenant> findByTrialEndDateBeforeAndSubscriptionStatus(LocalDateTime date, String status);
}
