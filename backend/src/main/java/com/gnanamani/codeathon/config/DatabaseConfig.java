package com.gnanamani.codeathon.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:${DATABASE_URL:}}")
    private String rawUrl;

    @Value("${spring.datasource.username:sa}")
    private String defaultUsername;

    @Value("${spring.datasource.password:password}")
    private String defaultPassword;

    @Value("${spring.datasource.driver-class-name:${SPRING_DATASOURCE_DRIVER:}}")
    private String defaultDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariDataSource ds = new HikariDataSource();

        if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            try {
                // Parse Cloud PostgreSQL URI (e.g., from Neon.tech, Supabase, Render, Railway)
                URI dbUri = new URI(rawUrl);
                String userInfo = dbUri.getUserInfo();
                String username = defaultUsername;
                String password = defaultPassword;

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    username = parts[0];
                    password = parts[1];
                }

                String host = dbUri.getHost();
                int port = dbUri.getPort() > 0 ? dbUri.getPort() : 5432;
                String path = dbUri.getPath();
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "neondb";
                String query = dbUri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
                if (query != null && !query.isEmpty()) {
                    jdbcUrl += "?" + query;
                } else if (!jdbcUrl.contains("sslmode")) {
                    jdbcUrl += "?sslmode=require";
                }

                log.info("Configured Cloud PostgreSQL datasource connecting to host: {}:{}", host, port);
                ds.setDriverClassName("org.postgresql.Driver");
                ds.setJdbcUrl(jdbcUrl);
                ds.setUsername(username);
                ds.setPassword(password);
                ds.setMaximumPoolSize(10);
                ds.setMinimumIdle(2);
                return ds;
            } catch (Exception e) {
                log.warn("Failed to parse PostgreSQL URI: {}. Falling back to standard configuration.", e.getMessage());
            }
        }

        // Standard or H2 default
        String url = (rawUrl != null && !rawUrl.isEmpty()) 
                ? rawUrl 
                : "jdbc:h2:mem:codeathondb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE";
        String driver = (defaultDriver != null && !defaultDriver.isEmpty()) 
                ? defaultDriver 
                : (url.contains("h2") ? "org.h2.Driver" : "org.postgresql.Driver");

        ds.setJdbcUrl(url);
        ds.setDriverClassName(driver);
        ds.setUsername(defaultUsername);
        ds.setPassword(defaultPassword);
        log.info("Initialized DataSource with driver: {} and URL: {}", driver, url);
        return ds;
    }
}
