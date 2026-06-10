package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.TransactionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRequestRepository extends JpaRepository<TransactionRequest, Long> {
    List<TransactionRequest> findByUser_IdOrderByCreatedAtDesc(Long userId);
    List<TransactionRequest> findByRequestStatus(String status);
    Optional<TransactionRequest> findByReferenceCode(String referenceCode);
}