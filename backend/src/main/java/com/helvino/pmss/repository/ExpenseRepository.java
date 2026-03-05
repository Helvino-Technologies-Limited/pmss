package com.helvino.pmss.repository;

import com.helvino.pmss.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, UUID> {
    List<Expense> findByTenantIdOrderByExpenseDateDesc(UUID tenantId);

    @Query("SELECT COALESCE(SUM(e.amount),0) FROM Expense e WHERE e.tenantId = :tenantId AND e.expenseDate >= :from AND e.expenseDate <= :to")
    BigDecimal sumExpensesBetween(UUID tenantId, LocalDate from, LocalDate to);
}
