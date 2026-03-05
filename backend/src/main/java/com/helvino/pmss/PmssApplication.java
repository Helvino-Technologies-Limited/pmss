package com.helvino.pmss;

import com.helvino.pmss.entity.User;
import com.helvino.pmss.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@EnableScheduling
@Slf4j
public class PmssApplication {

    public static void main(String[] args) {
        SpringApplication.run(PmssApplication.class, args);
    }

    @Bean
    CommandLineRunner initSuperAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.super-admin.email}") String adminEmail,
            @Value("${app.super-admin.password}") String adminPassword) {
        return args -> {
            userRepository.findByEmail(adminEmail).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode(adminPassword));
                    userRepository.save(user);
                    log.info("Super Admin password refreshed.");
                },
                () -> {
                    User superAdmin = User.builder()
                        .firstName("Helvino")
                        .lastName("Admin")
                        .email(adminEmail)
                        .passwordHash(passwordEncoder.encode(adminPassword))
                        .role("SUPER_ADMIN")
                        .isActive(true)
                        .build();
                    userRepository.save(superAdmin);
                    log.info("Super Admin created: {}", adminEmail);
                }
            );
        };
    }
}
