package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.entity.Race;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Long> {
    Page<Race> findAll(Pageable pageable);

    // ← chỉ dùng RaceStatus enum, bỏ String version
    Page<Race> findByStatus(RaceStatus status, Pageable pageable);
    List<Race> findByStatus(RaceStatus status);
    List<Race> findByStatusIn(List<RaceStatus> statuses);
    List<Race> findByReferee_Id(Long refereeId);

    // ← thêm để scheduler dùng
    List<Race> findByStatusAndStartTimeBefore(RaceStatus status, Instant time);
}
