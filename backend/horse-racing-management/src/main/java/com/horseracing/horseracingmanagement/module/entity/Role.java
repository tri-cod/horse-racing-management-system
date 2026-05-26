package com.horseracing.horseracingmanagement.module.entity;

import com.horseracing.horseracingmanagement.common.constant.RoleName;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "roles")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "rolename", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private RoleName rolename;

    @Size(max = 255)
    @Column(name = "description")
    private String description;


}