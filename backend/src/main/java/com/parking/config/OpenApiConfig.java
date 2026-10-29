package com.parking.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI smartParkingOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Smart Parking Management System API")
                        .description("Production-grade RESTful API for real-time smart parking slot management, vehicle entry, concurrency-controlled booking, block-rate fee calculation, vehicle checkout, payment status management, and daily revenue reporting.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Smart Parking Engineering Team")
                                .email("support@smartparking.local"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0.html")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server (Host / PC)"),
                        new Server().url("http://10.0.2.2:8080").description("Android Emulator Host Loopback"),
                        new Server().url("http://127.0.0.1:8080").description("Localhost IP")
                ));
    }
}
