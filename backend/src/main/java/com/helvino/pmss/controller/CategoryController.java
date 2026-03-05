package com.helvino.pmss.controller;

import com.helvino.pmss.config.TenantContext;
import com.helvino.pmss.dto.response.ApiResponse;
import com.helvino.pmss.entity.Category;
import com.helvino.pmss.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;

    private UUID tenantId() {
        return UUID.fromString(TenantContext.getCurrentTenant());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok("Categories", categoryRepository.findByTenantId(tenantId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody Category category) {
        category.setTenantId(tenantId());
        return ResponseEntity.ok(ApiResponse.ok("Category created", categoryRepository.save(category)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Category deleted", null));
    }
}
