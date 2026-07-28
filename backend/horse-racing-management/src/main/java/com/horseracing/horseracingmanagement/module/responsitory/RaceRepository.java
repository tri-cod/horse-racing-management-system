package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.entity.Race;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * Danh sách race dùng cho báo cáo doanh thu.
     * from/to luôn khác null — service tự thay null bằng biên mặc định.
     * Chỉ lấy race đã kết thúc vì race chưa xong thì số liệu còn biến động.
     */
    @Query("""
    SELECT r FROM Race r
    WHERE r.status = com.horseracing.horseracingmanagement.common.constant.RaceStatus.FINISHED
      AND r.startTime >= :from
      AND r.startTime <= :to
    """)
    Page<Race> findForRevenueReport(@Param("from") Instant from,
                                    @Param("to") Instant to,
                                    Pageable pageable);
}
