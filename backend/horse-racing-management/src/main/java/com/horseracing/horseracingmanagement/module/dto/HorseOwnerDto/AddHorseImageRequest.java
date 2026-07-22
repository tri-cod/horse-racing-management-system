package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddHorseImageRequest {
    @NotBlank(message = "Image URL must not be blank")
    private String imageUrl;
}
