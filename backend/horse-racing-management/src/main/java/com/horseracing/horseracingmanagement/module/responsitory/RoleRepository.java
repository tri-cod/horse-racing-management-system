package com.horseracing.horseracingmanagement.module.responsitory;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import com.horseracing.horseracingmanagement.module.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository  extends JpaRepository<Role,Long> {
    Optional<Role> findByRolename(RoleName name);

    boolean existsByRolename(RoleName name);
}
