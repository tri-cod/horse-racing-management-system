package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.entity.Race;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RaceRepository extends JpaRepository<Race, Long> {
    Page<Race> findAll(Pageable pageable);
    Page<Race> findByStatus(String status, Pageable pageable);
    List<Race> findByStatus(RaceStatus status);
}
