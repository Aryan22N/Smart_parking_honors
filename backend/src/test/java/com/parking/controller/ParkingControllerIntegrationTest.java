package com.parking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.parking.dto.request.VehicleEntryRequest;
import com.parking.entity.ParkingSlot;
import com.parking.enums.SlotStatus;
import com.parking.repository.ParkingSlotRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("Parking Controller Integration Tests")
class ParkingControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ParkingSlotRepository slotRepository;

    @BeforeEach
    void setUp() {
        if (slotRepository.count() == 0) {
            for (int i = 1; i <= 5; i++) {
                slotRepository.save(new ParkingSlot("TEST-A-0" + i, SlotStatus.AVAILABLE));
            }
        }
    }

    @Test
    @DisplayName("GET /api/v1/slots/availability returns summary")
    void testGetSlotAvailability() throws Exception {
        mockMvc.perform(get("/api/v1/slots/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSlots", greaterThanOrEqualTo(5)))
                .andExpect(jsonPath("$.availableSlots", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.occupancyRatePercent", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/v1/sessions/entry returns 201 Created on valid vehicle number")
    void testSuccessfulVehicleEntry() throws Exception {
        VehicleEntryRequest request = new VehicleEntryRequest("DL01AB9999", null);

        mockMvc.perform(post("/api/v1/sessions/entry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.vehicleNumber", is("DL01AB9999")))
                .andExpect(jsonPath("$.slotNumber", notNullValue()))
                .andExpect(jsonPath("$.status", is("ACTIVE")));
    }

    @Test
    @DisplayName("POST /api/v1/sessions/entry returns 400 Bad Request on invalid vehicle registration")
    void testInvalidVehicleNumberFailsValidation() throws Exception {
        VehicleEntryRequest request = new VehicleEntryRequest("INVALID-NUMBER", null);

        mockMvc.perform(post("/api/v1/sessions/entry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("BAD_REQUEST")))
                .andExpect(jsonPath("$.message", containsString("Validation failed")));
    }

    @Test
    @DisplayName("GET /api/v1/reports/revenue returns valid report structure")
    void testGetDailyRevenueReport() throws Exception {
        mockMvc.perform(get("/api/v1/reports/revenue"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date", notNullValue()))
                .andExpect(jsonPath("$.totalFinalizedCharges", notNullValue()))
                .andExpect(jsonPath("$.currency", is("INR")));
    }
}
