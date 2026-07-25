package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.TransactionRequest;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface TransactionRepostitory extends JpaRepository<TransactionRequest,Long> {
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionRequest t WHERE t.requestType = :type AND t.requestStatus = 'APPROVED'")
    BigDecimal sumApprovedByType(@Param("type") String type);
    @Query("SELECT COUNT(t) FROM TransactionRequest t WHERE t.requestType = :type AND t.requestStatus = 'PENDING'")
    long countPendingByType(@Param("type") String type);
}
