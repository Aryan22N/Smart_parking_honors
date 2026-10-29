package com.parking.dto.request;

import com.parking.enums.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public class PaymentUpdateRequest {

    @NotNull(message = "Payment status is required.")
    @Schema(description = "Updated payment status (must be PAID for completed session)", example = "PAID", requiredMode = Schema.RequiredMode.REQUIRED)
    private PaymentStatus paymentStatus;

    public PaymentUpdateRequest() {
    }

    public PaymentUpdateRequest(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
}
