package com.parking.controller;

import com.parking.dto.response.DailyRevenueResponse;
import com.parking.service.ReportingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Endpoints for revenue and operational reports")
public class ReportingController {

    private final ReportingService reportingService;

    public ReportingController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/revenue")
    @Operation(summary = "Get daily revenue report", description = "Returns aggregated revenue for a specific date (ISO format YYYY-MM-DD). If omitted, returns today's revenue.")
    public ResponseEntity<DailyRevenueResponse> getDailyRevenue(
            @Parameter(description = "Reporting date in YYYY-MM-DD format", example = "2026-10-29")
            @RequestParam(name = "date", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportingService.getDailyRevenue(date));
    }
}
