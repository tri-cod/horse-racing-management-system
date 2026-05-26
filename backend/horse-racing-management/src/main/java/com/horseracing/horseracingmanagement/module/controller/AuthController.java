package com.horseracing.horseracingmanagement.module.controller;

import com.horseracing.horseracingmanagement.module.dto.LoginRequest;
import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import com.horseracing.horseracingmanagement.module.service.UserService;
import io.swagger.v3.oas.models.responses.ApiResponse;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.Optional;

@RestController
public class AuthController {
    UserService userService;


    @GetMapping("/")
    public String greet(HttpServletRequest request) {
        return "Welcome to Horseracing Management" +  request.getSession().getId();
    }



}
