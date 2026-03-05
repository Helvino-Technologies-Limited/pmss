package com.helvino.pmss.service;

import com.helvino.pmss.dto.request.LoginRequest;
import com.helvino.pmss.dto.request.RegisterTenantRequest;
import com.helvino.pmss.dto.response.AuthResponse;
import com.helvino.pmss.entity.Tenant;
import com.helvino.pmss.entity.User;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.TenantRepository;
import com.helvino.pmss.repository.UserRepository;
import com.helvino.pmss.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.trial.days:5}")
    private int trialDays;

    @Transactional
    public AuthResponse register(RegisterTenantRequest request) {
        if (tenantRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered.");
        }
        if (tenantRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone already registered.");
        }

        Tenant tenant = Tenant.builder()
            .pharmacyName(request.getPharmacyName())
            .ownerName(request.getOwnerName())
            .phone(request.getPhone())
            .email(request.getEmail())
            .kraPin(request.getKraPin())
            .physicalAddress(request.getPhysicalAddress())
            .licenseNumber(request.getLicenseNumber())
            .planType("TRIAL")
            .subscriptionStatus("TRIAL")
            .trialEndDate(LocalDateTime.now().plusDays(trialDays))
            .isActive(true)
            .build();

        tenant = tenantRepository.save(tenant);

        User admin = User.builder()
            .tenantId(tenant.getId())
            .firstName(request.getOwnerName().split(" ")[0])
            .lastName(request.getOwnerName().contains(" ") ? request.getOwnerName().split(" ", 2)[1] : "")
            .email(request.getEmail())
            .phone(request.getPhone())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .role("TENANT_ADMIN")
            .isActive(true)
            .build();

        userRepository.save(admin);
        log.info("New tenant registered: {}", request.getPharmacyName());

        String token = jwtTokenProvider.generateToken(
            admin.getEmail(),
            tenant.getId().toString(),
            admin.getRole(),
            admin.getId().toString()
        );

        long daysLeft = ChronoUnit.DAYS.between(LocalDateTime.now(), tenant.getTrialEndDate());

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .email(admin.getEmail())
            .fullName(request.getOwnerName())
            .role(admin.getRole())
            .tenantId(tenant.getId().toString())
            .pharmacyName(tenant.getPharmacyName())
            .subscriptionStatus(tenant.getSubscriptionStatus())
            .trialDaysLeft(daysLeft)
            .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String tenantId = user.getTenantId() != null ? user.getTenantId().toString() : "SUPER_ADMIN";
        String token = jwtTokenProvider.generateToken(
            user.getEmail(), tenantId, user.getRole(), user.getId().toString()
        );

        String pharmacyName = "Helvino Admin";
        String subscriptionStatus = "ACTIVE";
        long trialDaysLeft = 0;

        if (user.getTenantId() != null) {
            Tenant tenant = tenantRepository.findById(user.getTenantId()).orElse(null);
            if (tenant != null) {
                pharmacyName = tenant.getPharmacyName();
                subscriptionStatus = tenant.getSubscriptionStatus();
                if ("TRIAL".equals(subscriptionStatus) && tenant.getTrialEndDate() != null) {
                    trialDaysLeft = Math.max(0, ChronoUnit.DAYS.between(LocalDateTime.now(), tenant.getTrialEndDate()));
                }
                if (!tenant.getIsActive()) {
                    throw new IllegalStateException("Your account is inactive. Please contact support.");
                }
            }
        }

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .email(user.getEmail())
            .fullName(user.getFirstName() + " " + user.getLastName())
            .role(user.getRole())
            .tenantId(tenantId)
            .pharmacyName(pharmacyName)
            .subscriptionStatus(subscriptionStatus)
            .trialDaysLeft(trialDaysLeft)
            .build();
    }
}
