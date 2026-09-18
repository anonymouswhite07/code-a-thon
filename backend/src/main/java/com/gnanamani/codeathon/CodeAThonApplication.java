package com.gnanamani.codeathon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CodeAThonApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodeAThonApplication.class, args);
    }
}
