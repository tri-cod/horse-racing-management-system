package com.horseracing.horseracingmanagement.module.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "trainer")
public class Trainer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // ← thêm
    @Column(name = "id", nullable = false)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    @Column(name = "name", length = 150)
    private String name;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;


    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "avatar_url")
    private String avatarUrl;         // ← ảnh đại diện

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    // Thêm vào Trainer entity
    @Column(name = "monthly_fee", precision = 12, scale = 2)
    private BigDecimal monthlyFee;    // phí thuê theo tháng

    @Column(name = "period_fee", precision = 12, scale = 2)
    private BigDecimal periodFee;     // phí thuê theo kỳ (3 tháng, 6 tháng...)

    @Column(name = "period_months")
    private Integer periodMonths;     // kỳ là bao nhiêu tháng (3, 6, 12...)

    @Column(name = "max_horses")
    private Integer maxHorses;        // tối đa bao nhiêu ngựa cùng lúc

    @Column(name = "specialization", length = 255)
    private String specialization;    // chuyên môn: "Thoroughbred, Sprinting, Endurance..."

    @Column(name = "location", length = 150)
    private String location;          // địa điểm huấn luyện

    @Column(name = "is_available")
    private Boolean isAvailable = true;  // đang nhận ngựa mới không


    @Column(name = "status", length = 20)
    private String status;

}