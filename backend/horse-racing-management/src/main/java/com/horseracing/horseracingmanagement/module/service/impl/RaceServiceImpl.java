package com.horseracing.horseracingmanagement.module.service.impl;

import com.horseracing.horseracingmanagement.common.constant.RaceStatus;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceRequest;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.CreateRaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceResponse;
import com.horseracing.horseracingmanagement.module.dto.RaceDto.RaceStatusUpdate;
import com.horseracing.horseracingmanagement.module.entity.Race;
import com.horseracing.horseracingmanagement.module.entity.RaceReferee;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.BetItemRepository;
import com.horseracing.horseracingmanagement.module.responsitory.BetRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceHorseRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRefereeRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceRepository;
import com.horseracing.horseracingmanagement.module.responsitory.RaceResultRepository;
import com.horseracing.horseracingmanagement.module.service.RaceHorseService;
import jakarta.transaction.Transactional;
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
    private final WebSocketNotificationService wsService;
    private final BetItemRepository betItemRepository;
    private final BetRepository betRepository;
    private final RaceResultRepository raceResultRepository;
    private final RaceHorseRepository raceHorseRepository;
    private final RaceHorseService raceHorseService;


    // Admin start race → đóng bet
    public RaceResponse startRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        // ← fix: phải là CLOSED_REGISTRATION mới được start
        if (race.getStatus() != RaceStatus.CLOSED_REGISTRATION) {
            throw new RuntimeException("Race must be CLOSED_REGISTRATION to start");
        }

        race.setStatus(RaceStatus.ONGOING);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("ONGOING")
                .message("Race has started! Betting is now closed.")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
    }

    // Referee finish race → push kết quả
    public RaceResponse finishRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.ONGOING) {
            throw new RuntimeException("Race must be ONGOING to finish");
        }


        // ← Push WebSocket → FE load kết quả
        // [CHANGED] "Finished" → "FINISHED": nhất quán UPPER_CASE với startRace và setRaceResult
        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("FINISHED")
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
                .orElseThrow(() -> new RuntimeException("Race not found"));

        race.setStatus(RaceStatus.CLOSED_REGISTRATION);
        raceRepository.save(race);

        // ← Xóa các đơn Pending chưa hoàn tất + hoàn phí
        raceHorseService.cleanupPendingOnClose(raceId);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("CLOSED_REGISTRATION")
                .message("Registration closed. Betting is now open!")
                .updatedAt(Instant.now())
                .build());

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
            RaceStatus raceStatus = RaceStatus.valueOf(status.toUpperCase());  // ← convert đúng
            return raceRepository.findByStatus(raceStatus, pageable).map(this::mapToResponse);
        }
        return raceRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void deleteRace(Long raceId) {
        if (!raceRepository.existsById(raceId)) {
            throw new RuntimeException("Race not found");
        }
        // Xóa theo đúng thứ tự FK: lá → gốc
        betItemRepository.deleteByBet_Race_Id(raceId);   // bet_items → bet → race
        betRepository.deleteByRace_Id(raceId);            // bet → race
        raceResultRepository.deleteByRace_Id(raceId);     // race_result → race_horse + race
        raceHorseRepository.deleteByRace_Id(raceId);      // race_horse → race
        raceRepository.deleteById(raceId);
    }

    @Override
    public RaceResponse updateRace(Long raceId, CreateRaceRequest request) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        RaceStatus oldStatus = race.getStatus(); // [WS] lưu status cũ để so sánh sau khi save


        validateRaceTimeUpdate(race, request);
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
        race.setRegistrationDeadline(request.getRegistrationDeadline());
        race.setLocation(request.getLocation());
        race.setCapacity(request.getCapacity());
        race.setBannerImageurl(request.getBannerImageurl());
        race.setStatus(request.getStatus());

        Race saved = raceRepository.save(race);

        // [WS] Chỉ push khi status thực sự thay đổi tránh gây noise cho FE
        if (request.getStatus() != null && request.getStatus() != oldStatus) {
            wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                    .raceId(saved.getId())
                    .raceName(saved.getRaceName())
                    .status(saved.getStatus().name())
                    .message("Race status updated.")
                    .updatedAt(Instant.now())
                    .build());
        }

        return mapToResponse(saved);
    }

    private void validateRaceTimeUpdate(Race race, CreateRaceRequest request) {
        Instant now = Instant.now();

        // Không cho sửa khi race đã ONGOING hoặc FINISHED
        if (race.getStatus() == RaceStatus.ONGOING ||
                race.getStatus() == RaceStatus.FINISHED) {
            throw new RuntimeException("Cannot edit a race that is ongoing or finished");
        }

        // startTime phải sau thời điểm hiện tại
        if (request.getStartTime() != null &&
                request.getStartTime().isBefore(now)) {
            throw new RuntimeException("Start time must be in the future");
        }

        // registrationDeadline phải trước startTime
        if (request.getRegistrationDeadline() != null &&
                request.getStartTime() != null &&
                request.getRegistrationDeadline().isAfter(request.getStartTime())) {
            throw new RuntimeException("Registration deadline must be before start time");
        }
        // endTime phải sau startTime
        if (request.getEndTime() != null &&
                request.getStartTime() != null &&
                request.getEndTime().isBefore(request.getStartTime())) {
            throw new RuntimeException("End time must be after start time");
        }

        // Nếu đã CLOSED_REGISTRATION mà đổi deadline về tương lai
        // → gợi ý reopen registration thay vì tự đổi
        if (race.getStatus() == RaceStatus.CLOSED_REGISTRATION &&
                request.getRegistrationDeadline() != null &&
                request.getRegistrationDeadline().isAfter(now)) {
            throw new RuntimeException(
                    "Race is already CLOSED_REGISTRATION. To reopen, use the reopen endpoint instead.");
        }
    }
    @Override
    public RaceResponse reopenRace(Long raceId) {
        Race race = raceRepository.findById(raceId)
                .orElseThrow(() -> new RuntimeException("Race not found"));

        if (race.getStatus() != RaceStatus.CLOSED_REGISTRATION) {
            throw new RuntimeException("Only CLOSED_REGISTRATION race can be reopened");
        }

        race.setStatus(RaceStatus.OPEN_REGISTRATION);
        raceRepository.save(race);

        wsService.sendRaceStatusUpdate(RaceStatusUpdate.builder()
                .raceId(race.getId())
                .raceName(race.getRaceName())
                .status("OPEN_REGISTRATION")
                .message("Registration reopened!")
                .updatedAt(Instant.now())
                .build());

        return mapToResponse(race);
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
                .status(race.getStatus() != null ? race.getStatus().name() : null)
                .registrationDeadline(race.getRegistrationDeadline())
                .createdAt(race.getCreatedAt())
                .updatedAt(race.getUpdatedAt())
                .refereeId(refereeId)
                .refereeName(refereeName)
                .build();
    }
}
