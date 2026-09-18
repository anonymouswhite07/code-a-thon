package com.gnanamani.codeathon.service;

import com.gnanamani.codeathon.domain.*;
import com.gnanamani.codeathon.dto.*;
import com.gnanamani.codeathon.repository.ParticipantRepository;
import com.gnanamani.codeathon.repository.UserRepository;
import com.gnanamani.codeathon.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditService auditService;

    public AuthService(
            UserRepository userRepository,
            ParticipantRepository participantRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider,
            AuthenticationManager authenticationManager,
            AuditService auditService) {
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.auditService = auditService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(Role.ROLE_PARTICIPANT);
        User savedUser = userRepository.save(user);

        Participant participant = new Participant(
                savedUser,
                request.getPhone(),
                request.getCollege(),
                request.getDepartment(),
                request.getYear(),
                request.getProgrammingExp()
        );
        Participant savedParticipant = participantRepository.save(participant);

        auditService.log(savedUser.getEmail(), "PARTICIPANT_REGISTERED", "User " + savedUser.getId(),
                "Registered from " + request.getCollege(), "127.0.0.1");

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getId(), savedUser.getFullName());
        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name(), savedParticipant.getId());
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Long participantId = null;
        if (user.getRole() == Role.ROLE_PARTICIPANT) {
            participantId = participantRepository.findByUser(user).map(Participant::getId).orElse(null);
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId(), user.getFullName());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), participantId);
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserResponse resp = new UserResponse();
        resp.setId(user.getId());
        resp.setEmail(user.getEmail());
        resp.setFullName(user.getFullName());
        resp.setRole(user.getRole().name());

        if (user.getRole() == Role.ROLE_PARTICIPANT) {
            participantRepository.findByUser(user).ifPresent(p -> {
                resp.setParticipantId(p.getId());
                resp.setCollege(p.getCollege());
                resp.setDepartment(p.getDepartment());
                resp.setYear(p.getYear());
                resp.setTotalScore(p.getTotalScore());
            });
        }

        return resp;
    }
}
