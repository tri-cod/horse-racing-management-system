package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.module.dto.RefereeDto.RefereeProfileResponse;
import com.horseracing.horseracingmanagement.module.entity.RaceReferee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RaceRefereeRepository extends JpaRepository<RaceReferee, Long> {
    Optional<RaceReferee> findByUser_Id(Long userId);

}