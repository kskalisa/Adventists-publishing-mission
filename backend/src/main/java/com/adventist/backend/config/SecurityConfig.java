package com.adventist.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.adventist.backend.auth.AuthService;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("form login is disabled");
        };
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthService authService) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/api/**").permitAll()
                        .requestMatchers("/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/verify-otp").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customer-requests").permitAll()
                        .requestMatchers("/api/access-requests/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/customer-requests/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/audit-logs/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/api/analytics/**").hasAuthority("ROLE_ADMIN")
                        // Ensure user management actions require explicit ROLE_ADMIN authority
                        .requestMatchers("/api/users/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/books/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/books/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/books/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers("/api/inventory/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/production-orders", "/api/production-orders/**").hasAnyRole("ADMIN", "COORDINATOR", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/production-orders").hasAnyRole("ADMIN", "COORDINATOR", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/production-orders/**").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/production-orders/**").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.POST, "/api/production-orders/**").hasAnyRole("ADMIN", "COORDINATOR")
                        .requestMatchers(HttpMethod.GET, "/api/sales").hasAnyRole("ADMIN", "SALES", "COORDINATOR", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/sales/my").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/sales").hasAnyRole("ADMIN", "SALES", "CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/sales/my/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.PUT, "/api/sales/my/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.DELETE, "/api/sales/my/**").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.PUT, "/api/sales/**").hasAnyRole("ADMIN", "SALES")
                        .requestMatchers(HttpMethod.GET, "/api/sales/**").hasAnyRole("ADMIN", "SALES", "COORDINATOR", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/notifications/my").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/book-requests").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.GET, "/api/book-requests/my").hasRole("CUSTOMER")
                        .requestMatchers("/api/book-requests/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/books/**").hasAnyRole("ADMIN", "SALES", "COORDINATOR", "INVENTORY_MANAGER", "CUSTOMER")
                        .requestMatchers("/api/customers/**").hasAnyRole("ADMIN", "SALES")
                        .requestMatchers("/api/dashboard", "/api/dashboard/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new TokenAuthenticationFilter(authService), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
