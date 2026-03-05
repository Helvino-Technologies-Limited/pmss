package com.helvino.pmss.service;

import com.helvino.pmss.dto.request.ProductRequest;
import com.helvino.pmss.entity.Product;
import com.helvino.pmss.exception.ResourceNotFoundException;
import com.helvino.pmss.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAll(UUID tenantId) {
        return productRepository.findByTenantIdAndIsActiveTrue(tenantId);
    }

    public Product getById(UUID tenantId, UUID productId) {
        return productRepository.findById(productId)
            .filter(p -> p.getTenantId().equals(tenantId))
            .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    }

    public Product getByBarcode(UUID tenantId, String barcode) {
        return productRepository.findByTenantIdAndBarcode(tenantId, barcode)
            .orElseThrow(() -> new ResourceNotFoundException("Product not found for barcode: " + barcode));
    }

    public List<Product> search(UUID tenantId, String query) {
        return productRepository.searchProducts(tenantId, query);
    }

    public List<Product> getExpiring(UUID tenantId, int days) {
        return productRepository.findExpiringProducts(tenantId, LocalDate.now().plusDays(days));
    }

    public List<Product> getLowStock(UUID tenantId) {
        return productRepository.findLowStockProducts(tenantId);
    }

    @Transactional
    public Product create(UUID tenantId, ProductRequest req) {
        Product product = Product.builder()
            .tenantId(tenantId)
            .drugName(req.getDrugName())
            .genericName(req.getGenericName())
            .brandName(req.getBrandName())
            .barcode(req.getBarcode())
            .productType(req.getProductType() != null ? req.getProductType() : "OTC")
            .dosageForm(req.getDosageForm())
            .strength(req.getStrength())
            .unitOfMeasure(req.getUnitOfMeasure() != null ? req.getUnitOfMeasure() : "Piece")
            .batchNumber(req.getBatchNumber())
            .expiryDate(req.getExpiryDate())
            .manufactureDate(req.getManufactureDate())
            .costPrice(req.getCostPrice())
            .sellingPrice(req.getSellingPrice())
            .vatPercent(req.getVatPercent())
            .quantity(req.getQuantity() != null ? req.getQuantity() : 0)
            .reorderLevel(req.getReorderLevel() != null ? req.getReorderLevel() : 10)
            .storageLocation(req.getStorageLocation())
            .description(req.getDescription())
            .categoryId(req.getCategoryId())
            .supplierId(req.getSupplierId())
            .isActive(true)
            .build();
        return productRepository.save(product);
    }

    @Transactional
    public Product update(UUID tenantId, UUID productId, ProductRequest req) {
        Product product = getById(tenantId, productId);
        product.setDrugName(req.getDrugName());
        product.setGenericName(req.getGenericName());
        product.setBrandName(req.getBrandName());
        product.setBarcode(req.getBarcode());
        product.setCostPrice(req.getCostPrice());
        product.setSellingPrice(req.getSellingPrice());
        product.setVatPercent(req.getVatPercent());
        product.setQuantity(req.getQuantity());
        product.setReorderLevel(req.getReorderLevel());
        product.setExpiryDate(req.getExpiryDate());
        product.setBatchNumber(req.getBatchNumber());
        product.setStorageLocation(req.getStorageLocation());
        return productRepository.save(product);
    }

    @Transactional
    public void delete(UUID tenantId, UUID productId) {
        Product product = getById(tenantId, productId);
        product.setIsActive(false);
        productRepository.save(product);
    }
}
