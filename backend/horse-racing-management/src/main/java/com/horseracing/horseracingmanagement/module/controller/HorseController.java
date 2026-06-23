package com.horseracing.horseracingmanagement.module.controller;


import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/horse")
@RequiredArgsConstructor
@Tag(name = "Horse", description = "Horse management APIs")
public class HorseController {

}
