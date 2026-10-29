package com.parking.service;

import com.parking.dto.response.DailyRevenueResponse;

import java.time.LocalDate;

public interface ReportingService {

    DailyRevenueResponse getDailyRevenue(LocalDate date);
}
