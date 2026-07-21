package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByStatusOrderByCreatedAtDesc(String status);
    List<Report> findByTargetTypeAndTargetId(String targetType, Long targetId);
    List<Report> findByReporter_Id(Long reporterId);
    long countByStatus(String status);
}