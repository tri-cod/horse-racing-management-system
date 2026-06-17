package com.horseracing.horseracingmanagement.module.responsitory;


import com.horseracing.horseracingmanagement.module.entity.HorseOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HorseOwnerRepository extends JpaRepository<HorseOwner, Long> {

    Optional<HorseOwner> findByUserId(Long userId);

    Optional<HorseOwner> findById(Long id);
}
