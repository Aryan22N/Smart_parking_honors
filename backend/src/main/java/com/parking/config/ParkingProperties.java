package com.parking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.time.ZoneId;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "parking")
public class ParkingProperties {

    private Pricing pricing = new Pricing();
    private String timezone = "Asia/Kolkata";
    private Cors cors = new Cors();

    public static class Pricing {
        private long blockDurationSeconds = 10800; // 3 hours
        private long blockRateInr = 50; // ₹50

        public long getBlockDurationSeconds() {
            return blockDurationSeconds;
        }

        public void setBlockDurationSeconds(long blockDurationSeconds) {
            this.blockDurationSeconds = blockDurationSeconds;
        }

        public long getBlockRateInr() {
            return blockRateInr;
        }

        public void setBlockRateInr(long blockRateInr) {
            this.blockRateInr = blockRateInr;
        }
    }

    public static class Cors {
        private List<String> allowedOrigins = List.of("*");
        private List<String> allowedMethods = List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS");
        private List<String> allowedHeaders = List.of("*");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }

        public List<String> getAllowedMethods() {
            return allowedMethods;
        }

        public void setAllowedMethods(List<String> allowedMethods) {
            this.allowedMethods = allowedMethods;
        }

        public List<String> getAllowedHeaders() {
            return allowedHeaders;
        }

        public void setAllowedHeaders(List<String> allowedHeaders) {
            this.allowedHeaders = allowedHeaders;
        }
    }

    public Pricing getPricing() {
        return pricing;
    }

    public void setPricing(Pricing pricing) {
        this.pricing = pricing;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public ZoneId getZoneId() {
        try {
            return ZoneId.of(timezone);
        } catch (Exception e) {
            return ZoneId.systemDefault();
        }
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }
}
