package com.parking.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    private final ParkingProperties parkingProperties;

    public CorsConfig(ParkingProperties parkingProperties) {
        this.parkingProperties = parkingProperties;
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(false);
        config.setAllowedOriginPatterns(parkingProperties.getCors().getAllowedOrigins());
        config.setAllowedHeaders(parkingProperties.getCors().getAllowedHeaders());
        config.setAllowedMethods(parkingProperties.getCors().getAllowedMethods());
        config.setMaxAge(3600L);

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
