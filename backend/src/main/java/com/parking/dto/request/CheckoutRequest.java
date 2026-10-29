package com.parking.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

public class CheckoutRequest {

    @Schema(description = "Optional explicit exit timestamp. If omitted, current server time is used.", example = "2026-10-29T10:30:00Z")
    private Instant exitTime;

    @Schema(description = "Whether to immediately mark payment as PAID upon checkout. Defaults to false (UNPAID).", example = "true")
    private Boolean markAsPaid = false;

    public CheckoutRequest() {
    }

    public CheckoutRequest(Instant exitTime, Boolean markAsPaid) {
        this.exitTime = exitTime;
        this.markAsPaid = markAsPaid;
    }

    public Instant getExitTime() {
        return exitTime;
    }

    public void setExitTime(Instant exitTime) {
        this.exitTime = exitTime;
    }

    public Boolean getMarkAsPaid() {
        return markAsPaid != null && markAsPaid;
    }

    public void setMarkAsPaid(Boolean markAsPaid) {
        this.markAsPaid = markAsPaid;
    }
}
