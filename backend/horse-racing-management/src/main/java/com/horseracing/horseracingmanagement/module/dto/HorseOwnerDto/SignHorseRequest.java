package com.horseracing.horseracingmanagement.module.dto.HorseOwnerDto;

import lombok.Data;

@Data
public class SignHorseRequest
{
    public String horseName;
    public String breed;
    public int age;
    public String gender;
    public int speedRating;
    public String history_rank;
    public String avatar_url;
}
