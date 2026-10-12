package com.gnanamani.codeathon.security;

import com.gnanamani.codeathon.domain.Role;
import com.gnanamani.codeathon.domain.User;
import com.gnanamani.codeathon.repository.ParticipantRepository;
import com.gnanamani.codeathon.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final ParticipantRepository participantRepository;

    public CustomUserDetailsService(UserRepository userRepository, ParticipantRepository participantRepository) {
        this.userRepository = userRepository;
        this.participantRepository = participantRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        boolean enabled = true;
        if (user.getRole() == Role.ROLE_PARTICIPANT) {
            enabled = !participantRepository.findByUser(user)
                    .map(p -> Boolean.TRUE.equals(p.getIsSuspended()))
                    .orElse(false);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                enabled, // enabled
                true,    // accountNonExpired
                true,    // credentialsNonExpired
                enabled, // accountNonLocked
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}
