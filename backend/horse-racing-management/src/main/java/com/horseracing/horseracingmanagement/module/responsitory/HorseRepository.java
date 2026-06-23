package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.module.entity.Horse;
import com.horseracing.horseracingmanagement.module.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HorseRepository extends JpaRepository<Horse, Long> {
    List<Horse> findByOwnerId(Long ownerId);

    // Search + filter horse theo tên, breed, status (cho admin xem toàn bộ)
    @Query("""
        SELECT DISTINCT h
        FROM Horse h
        WHERE
        (
            :keyword IS NULL
            OR LOWER(h.horseName) LIKE CONCAT('%', LOWER(CAST(:keyword AS string)), '%')
            OR LOWER(h.breed) LIKE CONCAT('%', LOWER(CAST(:keyword AS string)), '%')
        )
        AND (:status IS NULL OR h.status = :status)
        """)
    Page<Horse> findWithFilters(@Param("keyword") String keyword,
                                @Param("status") String status,
                                Pageable pageable);

    // Lấy danh sách horseId đã đăng ký trong 1 race cụ thể (để loại khi chọn ngựa khác cho race đó)
    @Query("SELECT rh.horse.id FROM RaceHorse rh WHERE rh.race.id = :raceId")
    List<Long> findHorseIdsByRaceId(@Param("raceId") Long raceId);
}
