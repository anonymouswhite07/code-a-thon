package com.gnanamani.codeathon.unit;

import com.gnanamani.codeathon.domain.Participant;
import com.gnanamani.codeathon.domain.Role;
import com.gnanamani.codeathon.domain.User;
import com.gnanamani.codeathon.dto.AuthResponse;
import com.gnanamani.codeathon.dto.LoginRequest;
import com.gnanamani.codeathon.dto.RegisterRequest;
import com.gnanamani.codeathon.dto.UserResponse;
import com.gnanamani.codeathon.repository.ParticipantRepository;
import com.gnanamani.codeathon.repository.UserRepository;
import com.gnanamani.codeathon.security.JwtTokenProvider;
import com.gnanamani.codeathon.service.AuditService;
import com.gnanamani.codeathon.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ParticipantRepository participantRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider tokenProvider;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private AuditService auditService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                participantRepository,
                passwordEncoder,
                tokenProvider,
                authenticationManager,
                auditService
        );
    }

    @Test
    @DisplayName("Valid registration saves user and participant, returns auth token")
    void testSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("student@gct.ac.in");
        request.setPassword("Secret@123");
        request.setFullName("John Doe");
        request.setPhone("9876543210");
        request.setCollege("Gnanamani College of Technology");
        request.setDepartment("CSE");
        request.setYear("3rd Year");
        request.setProgrammingExp("Intermediate");

        when(userRepository.existsByEmail("student@gct.ac.in")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("hashedPass");

        User savedUser = new User("student@gct.ac.in", "hashedPass", "John Doe", Role.ROLE_PARTICIPANT);
        savedUser.setId(5L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        Participant savedParticipant = new Participant(savedUser, "9876543210", "GCT", "CSE", "3rd Year", "Intermediate");
        savedParticipant.setId(10L);
        when(participantRepository.save(any(Participant.class))).thenReturn(savedParticipant);

        when(tokenProvider.generateToken("student@gct.ac.in", "ROLE_PARTICIPANT", 5L, "John Doe"))
                .thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("student@gct.ac.in", response.getEmail());
        assertEquals("ROLE_PARTICIPANT", response.getRole());
        assertEquals(5L, response.getId());
        assertEquals(10L, response.getParticipantId());
    }

    @Test
    @DisplayName("Registration rejects duplicate email")
    void testDuplicateEmailRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existing@gct.ac.in");
        when(userRepository.existsByEmail("existing@gct.ac.in")).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("already exists"));
    }

    @Test
    @DisplayName("Login with valid credentials returns JWT token")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("judge@gct.ac.in");
        request.setPassword("Judge@2026");

        User user = new User("judge@gct.ac.in", "hash", "Judge Priyadharshini", Role.ROLE_JUDGE);
        user.setId(3L);

        when(userRepository.findByEmail("judge@gct.ac.in")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken("judge@gct.ac.in", "ROLE_JUDGE", 3L, "Judge Priyadharshini"))
                .thenReturn("judge.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("judge.jwt.token", response.getToken());
        assertEquals("ROLE_JUDGE", response.getRole());
        assertNull(response.getParticipantId(), "Judges should not have a participant ID");
    }

    @Test
    @DisplayName("Login failure when authentication manager rejects credentials")
    void testInvalidPasswordLogin() {
        LoginRequest request = new LoginRequest();
        request.setEmail("admin@gct.ac.in");
        request.setPassword("WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Get current user profile retrieves complete participant metadata")
    void testGetCurrentUser() {
        User user = new User("student@gct.ac.in", "hash", "Alice", Role.ROLE_PARTICIPANT);
        user.setId(7L);
        when(userRepository.findByEmail("student@gct.ac.in")).thenReturn(Optional.of(user));

        Participant participant = new Participant(user, "9998887776", "GCT", "IT", "2nd Year", "Beginner");
        participant.setId(22L);
        participant.setTotalScore(150);
        when(participantRepository.findByUser(user)).thenReturn(Optional.of(participant));

        UserResponse response = authService.getCurrentUser("student@gct.ac.in");

        assertNotNull(response);
        assertEquals(7L, response.getId());
        assertEquals("student@gct.ac.in", response.getEmail());
        assertEquals(22L, response.getParticipantId());
        assertEquals("GCT", response.getCollege());
        assertEquals(150, response.getTotalScore());
    }
}
