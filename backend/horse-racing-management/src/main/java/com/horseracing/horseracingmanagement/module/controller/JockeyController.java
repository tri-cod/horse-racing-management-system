package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.common.response.ApiResponse;
import com.horseracing.horseracingmanagement.module.dto.JockeyDto.JockeyResponse;
import com.horseracing.horseracingmanagement.module.entity.Jockey;
import com.horseracing.horseracingmanagement.module.responsitory.JockeyRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jockeys")
@RequiredArgsConstructor
@Tag(name = "Jockey", description = "Jockey management APIs")
public class JockeyController {

    private final JockeyRepository jockeyRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<JockeyResponse>>> getJockeyList() {
        List<Jockey> jockeys = jockeyRepository.findByStatus("Active");
        List<JockeyResponse> response = jockeys.stream()
                .map(j -> JockeyResponse.builder()
                        .id(j.getId())
                        .name(j.getUser().getFullName() != null
                                ? j.getUser().getFullName()
                                : j.getUser().getUsername())
                        .age(j.getAge())
                        .experienceYear(j.getExperienceYear())
                        .status(j.getStatus())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Success", response));
    }
}