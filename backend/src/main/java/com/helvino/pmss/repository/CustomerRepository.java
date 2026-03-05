package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    List<Customer> findByTenantId(UUID tenantId);
    Optional<Customer> findByTenantIdAndPhone(UUID tenantId, String phone);

    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND (LOWER(c.firstName) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(c.lastName) LIKE LOWER(CONCAT('%',:q,'%')) OR c.phone LIKE CONCAT('%',:q,'%'))")
    List<Customer> searchCustomers(UUID tenantId, String q);
}
