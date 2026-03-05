package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.request.UserRequest;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.User;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private UUID tenantId() {
        return UUID.fromString(TenantContext.getCurrentTenant());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Staff", userRepository.findByTenantId(tenantId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
            .filter(u -> tenantId().equals(u.getTenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(ApiResponse.ok("User", user));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> create(@Valid @RequestBody UserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        User user = User.builder()
            .tenantId(tenantId())
            .firstName(req.getFirstName())
            .lastName(req.getLastName())
            .email(req.getEmail())
            .phone(req.getPhone())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .role(req.getRole() != null ? req.getRole() : "CASHIER")
            .isActive(true)
            .build();
        return ResponseEntity.ok(ApiResponse.ok("Staff member created", userRepository.save(user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> update(@PathVariable UUID id, @Valid @RequestBody UserRequest req) {
        User user = userRepository.findById(id)
            .filter(u -> tenantId().equals(u.getTenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setPhone(req.getPhone());
        user.setRole(req.getRole());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        }
        return ResponseEntity.ok(ApiResponse.ok("User updated", userRepository.save(user)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID id) {
        User user = userRepository.findById(id)
            .filter(u -> tenantId().equals(u.getTenantId()))
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User deactivated", null));
    }
}
