package com.helvino.pmss.service;

import com.helvino.pmss.entity.SubscriptionPayment;
import com.helvino.pmss.entity.Tenant;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.SubscriptionPaymentRepository;
import com.helvino.pmss.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository tenantRepository;
    private final SubscriptionPaymentRepository paymentRepository;

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public Tenant getById(UUID id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found"));
    }

    @Transactional
    public Tenant activateSubscription(UUID tenantId, String paymentMethod,
                                        String reference, UUID recordedBy, String paymentType) {
        Tenant tenant = getById(tenantId);

        BigDecimal amount = "SETUP".equals(paymentType)
            ? new BigDecimal("20000")
            : new BigDecimal("15000");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime validUntil = now.plusYears(1);

        SubscriptionPayment payment = SubscriptionPayment.builder()
            .tenantId(tenantId)
            .paymentType(paymentType)
            .amount(amount)
            .paymentDate(now)
            .paymentMethod(paymentMethod)
            .transactionReference(reference)
            .recordedBy(recordedBy)
            .validFrom(now)
            .validUntil(validUntil)
            .build();

        paymentRepository.save(payment);

        tenant.setSubscriptionStatus("ACTIVE");
        tenant.setSubscriptionEndDate(validUntil);
        tenant.setIsActive(true);
        tenant.setPlanType("STANDARD");

        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant toggleTenant(UUID tenantId, boolean active) {
        Tenant tenant = getById(tenantId);
        tenant.setIsActive(active);
        return tenantRepository.save(tenant);
    }

    // Auto-deactivate expired trial/subscriptions every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void autoDeactivateExpired() {
        LocalDateTime now = LocalDateTime.now();

        // Expire trials
        List<Tenant> expiredTrials = tenantRepository
            .findByTrialEndDateBeforeAndSubscriptionStatus(now, "TRIAL");

        for (Tenant t : expiredTrials) {
            t.setSubscriptionStatus("EXPIRED");
            t.setIsActive(false);
            tenantRepository.save(t);
            log.info("Trial expired for tenant: {}", t.getPharmacyName());
        }
    }
}
