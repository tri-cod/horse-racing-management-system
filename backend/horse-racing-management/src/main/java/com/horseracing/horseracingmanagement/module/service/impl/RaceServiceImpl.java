package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.entity.Race;
import com.horseracing.horseracingmanagement.module.entity.RaceReferee;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRefereeRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRepository;
import com.horseracing.horseracingmanagement.module.service.RaceService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RaceServiceImpl implements RaceService {

    private final RaceRepository raceRepository;
    private final RaceRefereeRepository raceRefereeRepository;
    private final WebSocketNotificationService wsService;  // ← inject


    // Admin start race → đóng bet
    public RaceResponse startRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (!race.getStatus().equals("Upcoming")) {
            throw new RuntimeException("Race is not in Upcoming status");
        }

        race.setStatus(RaceStatus.ONGOING);
        raceRepository.save(race);

        // ← Push WebSocket → FE tự disable nút đặt cược
        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("Ongoing")
                .message("Race has started! Betting is now closed.")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    // Referee finish race → push kết quả
    public RaceResponse finishRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        race.setStatus(RaceStatus.FINISHED);
        raceRepository.save(race);

        // ← Push WebSocket → FE load kết quả
        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("Finished")
                .message("Race has finished! Results are being calculated.")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    @Override
    public RaceResponse createRace(CreateRaceRequest request) {
        // tìm referee nếu admin có set
        RaceReferee referee = null;
        if (request.getRefereeId() != null) {
            referee = raceRefereeRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Referee not found"));
        }

        Race race = Race.builder()
                .raceName(request.getRaceName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .trackName(request.getTrackName())
                .trackCondition(request.getTrackCondition())
                .surfaceType(request.getSurfaceType())
                .totalprizepool(request.getTotalprizepool())
                .distance(request.getDistance())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .bannerImageurl(request.getBannerImageurl())
                .registrationDeadline(request.getRegistrationDeadline())
                .status(request.getStatus())
                .referee(referee)
                .build();

        return mapToResponse(raceRepository.save(race));
    }

    @Override
    public RaceResponse closeRace(Long raceId) {

        Race race = raceRepository.findById(raceId)
                .orElseThrow();

        race.setStatus(RaceStatus.CLOSED_REGISTRATION);

        raceRepository.save(race);

        return mapToResponse(race);
    }

    @Override
    public RaceResponse getRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));
        return mapToResponse(race);
    }

    @Override
    public Page<RaceResponse> getRaceList(String status, Pageable pageable) {
        if (status != null) {
            return raceRepository.findByStatus(status, pageable).map(this::mapToResponse);
        }
        return raceRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public void deleteRace(Long raceId) {
        if (!raceRepository.existsById(raceId)) {
            throw new RuntimeException("Race not found");
        }
        raceRepository.deleteById(raceId);
    }

    @Override
    public RaceResponse updateRace(Long raceId, CreateRaceRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (request.getRefereeId() != null) {
            RaceReferee referee = raceRefereeRepository.findById(request.getRefereeId())
                    .orElseThrow(() -> new RuntimeException("Referee not found"));
            race.setReferee(referee);
        }

        race.setRaceName(request.getRaceName());
        race.setStartTime(request.getStartTime());
        race.setEndTime(request.getEndTime());
        race.setTrackName(request.getTrackName());
        race.setTrackCondition(request.getTrackCondition());
        race.setSurfaceType(request.getSurfaceType());
        race.setTotalprizepool(request.getTotalprizepool());
        race.setDistance(request.getDistance());
        race.setLocation(request.getLocation());
        race.setCapacity(request.getCapacity());
        race.setBannerImageurl(request.getBannerImageurl());
        race.setStatus(request.getStatus());

        return mapToResponse(raceRepository.save(race));
    }




    private RaceResponse mapToResponse(Race race) {
        String refereeName = null;
        Long refereeId = null;

        if (race.getReferee() != null) {
            refereeId = race.getReferee().getId();
            User refereeUser = race.getReferee().getUser();
            refereeName = refereeUser.getFullName() != null
                    ? refereeUser.getFullName()
                    : refereeUser.getUsername();
        }

        return RaceResponse.builder()
                .id(race.getId())
                .raceName(race.getRaceName())
                .startTime(race.getStartTime())
                .endTime(race.getEndTime())
                .trackName(race.getTrackName())
                .trackCondition(race.getTrackCondition())
                .surfaceType(race.getSurfaceType())
                .totalprizepool(race.getTotalprizepool())
                .distance(race.getDistance())
                .location(race.getLocation())
                .capacity(race.getCapacity())
                .bannerImageurl(race.getBannerImageurl())
                .status(race.getStatus().name())
                .registrationDeadline(race.getRegistrationDeadline())
                .createdAt(race.getCreatedAt())
                .updatedAt(race.getUpdatedAt())
                .refereeId(refereeId)
                .refereeName(refereeName)
                .build();
    }
}
