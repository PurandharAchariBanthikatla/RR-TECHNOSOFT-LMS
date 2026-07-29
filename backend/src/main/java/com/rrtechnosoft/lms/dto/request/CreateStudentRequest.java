package com.rrtechnosoft.lms.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateStudentRequest(
        @NotBlank String fullName,
        String phone,
        @NotBlank String initialPassword,
        String batch,
        String branch,
        String college,
        Integer graduationYear
        // studentId is server-generated (e.g. RRT2026S0001) — see AdminService.createStudent
) {}
