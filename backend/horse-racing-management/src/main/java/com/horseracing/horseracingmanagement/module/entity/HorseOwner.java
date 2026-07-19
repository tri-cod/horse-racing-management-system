package com.horseracing.horseracingmanagement.module.entity;

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
@Table(name = "horse_owner")
public class HorseOwner {
    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Size(max = 150)
    @NotNull
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;


    // Thêm vào HorseOwner entity
    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "total_horses")
    private Integer totalHorses = 0;  // tổng số ngựa sở hữu (sync tự động)
    @Size(max = 20)
    @Column(name = "status", length = 20)
    private String status;

}