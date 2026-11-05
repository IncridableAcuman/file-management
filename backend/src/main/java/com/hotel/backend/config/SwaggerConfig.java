package com.hotel.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI(){
        final String securitySchemaName = "BearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("File Management System")
                        .version("1.0.0")
                        .description("Swagger documentation for file management system via Java/Spring Gradle")
                        .contact(new Contact()
                                .name("admin")
                                .email("admin@gmail.com")
                        ))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemaName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemaName, new SecurityScheme()
                                .name(securitySchemaName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter your access token")
                        )
                );
    }
}
