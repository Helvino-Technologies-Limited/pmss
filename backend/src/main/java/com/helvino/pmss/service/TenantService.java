package com.helvino.pmss.service;

import com.helvino.pmss.dto.response.AuthResponse;
import com.helvino.pmss.entity.SubscriptionPayment;
import com.helvino.pmss.entity.Tenant;
import com.helvino.pmss.entity.User;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.SubscriptionPaymentRepository;
import com.helvino.pmss.repository.TenantRepository;
import com.helvino.pmss.repository.UserRepository;
import com.helvino.pmss.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TenantService {

    private final TenantRepository tenantRepository;
    private final SubscriptionPaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

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

    public AuthResponse impersonate(UUID tenantId) {
        Tenant tenant = getById(tenantId);
        User admin = userRepository.findByTenantId(tenantId).stream()
            .filter(u -> "TENANT_ADMIN".equals(u.getRole()) && Boolean.TRUE.equals(u.getIsActive()))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("No active admin user found for this tenant"));

        long daysLeft = 0;
        if (tenant.getTrialEndDate() != null) {
            daysLeft = Math.max(0, ChronoUnit.DAYS.between(LocalDate.now(), tenant.getTrialEndDate().toLocalDate()));
        }

        String token = jwtTokenProvider.generateToken(
            admin.getEmail(), tenantId.toString(), admin.getRole(), admin.getId().toString());

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .email(admin.getEmail())
            .fullName(admin.getFirstName() + " " + admin.getLastName())
            .role(admin.getRole())
            .tenantId(tenantId.toString())
            .pharmacyName(tenant.getPharmacyName())
            .subscriptionStatus(tenant.getSubscriptionStatus())
            .trialDaysLeft(daysLeft)
            .build();
    }

    @Transactional
    public Tenant extendSubscription(UUID tenantId, int months) {
        Tenant tenant = getById(tenantId);
        LocalDateTime base = (tenant.getSubscriptionEndDate() != null
            && tenant.getSubscriptionEndDate().isAfter(LocalDateTime.now()))
            ? tenant.getSubscriptionEndDate()
            : LocalDateTime.now();
        tenant.setSubscriptionEndDate(base.plusMonths(months));
        tenant.setSubscriptionStatus("ACTIVE");
        tenant.setIsActive(true);
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
