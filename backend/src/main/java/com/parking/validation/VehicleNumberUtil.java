package com.parking.validation;

import java.util.regex.Pattern;

public final class VehicleNumberUtil {

    private static final Pattern INDIAN_VEHICLE_PATTERN = Pattern.compile(
            "^([A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}|[0-9]{2}BH[0-9]{4}[A-Z]{1,2})$"
    );

    private VehicleNumberUtil() {
    }

    public static String normalize(String vehicleNumber) {
        if (vehicleNumber == null) {
            return null;
        }
        return vehicleNumber.replaceAll("[\\s\\-]+", "").toUpperCase().trim();
    }

    public static boolean isValid(String vehicleNumber) {
        if (vehicleNumber == null) {
            return false;
        }
        String normalized = normalize(vehicleNumber);
        return INDIAN_VEHICLE_PATTERN.matcher(normalized).matches();
    }
}
