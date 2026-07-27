package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.entity.Race;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Long> {
    Page<Race> findAll(Pageable pageable);

    // ← chỉ dùng RaceStatus enum, bỏ String version
    Page<Race> findByStatus(RaceStatus status, Pageable pageable);
    List<Race> findByStatus(RaceStatus status);
    List<Race> findByStatusIn(List<RaceStatus> statuses);
    List<Race> findByReferee_Id(Long refereeId);
    @Query("SELECT COUNT(r) FROM Race r WHERE r.status = :status")
    long countByStatus(@Param("status") RaceStatus status);


    Page<Race> findByStatusOrderByStartTimeDesc(RaceStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(r.totalprizepool), 0) FROM Race r WHERE r.totalprizepool IS NOT NULL")
    BigDecimal sumTotalPrizePool();

    // ← thêm để scheduler dùng
    List<Race> findByStatusAndStartTimeBefore(RaceStatus status, Instant time);
}
