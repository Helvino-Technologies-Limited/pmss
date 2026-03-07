package com.helvino.pmss.controller;

import com.helvino.pmss.dto.request.LoginRequest;
import com.helvino.pmss.dto.request.RegisterTenantRequest;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.dto.response.AuthResponse;
import com.helvino.pmss.service.AuthService;
import com.helvino.pmss.service.TenantService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TenantService tenantService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterTenantRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Your 5-day trial has started!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/exit-impersonation")
    public ResponseEntity<ApiResponse<AuthResponse>> exitImpersonation(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (!StringUtils.hasText(bearer) || !bearer.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Unauthorized");
        }
        AuthResponse response = tenantService.exitImpersonation(bearer.substring(7));
        return ResponseEntity.ok(ApiResponse.ok("Returned to super admin", response));
    }
}
