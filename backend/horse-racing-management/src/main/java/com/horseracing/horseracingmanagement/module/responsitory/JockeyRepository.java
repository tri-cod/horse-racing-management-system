package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.entity.Jockey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JockeyRepository extends JpaRepository<Jockey, Long> {
    Optional<Jockey> findByUserId(Long userId);
    List<Jockey> findByStatus(String status);
}
