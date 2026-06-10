package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.common.constant.UserStatus;
import com.horseracing.horseracingmanagement.module.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springdoc.core.providers.JavadocProvider;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository  extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);


    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByRole_Rolename(RoleName rolename);



    @Query("""
SELECT DISTINCT u
FROM User u
LEFT JOIN u.role r
WHERE
(
    :keyword IS NULL
    OR LOWER(u.email) LIKE CONCAT('%', LOWER(CAST(:keyword AS string)), '%')
    OR LOWER(u.fullName) LIKE CONCAT('%', LOWER(CAST(:keyword AS string)), '%')
)
AND (:status IS NULL OR u.status = :status)
AND (:roleName IS NULL OR r.rolename = :roleName)
""")
    Page<User> findWithFilters(@Param("keyword") String keyword,
                               @Param("status") UserStatus status,
                               @Param("roleName") RoleName roleName,
                               Pageable pageable);

}
