package com.horseracing.horseracingmanagement.security;

import com.horseracing.horseracingmanagement.module.entity.User;
import com.horseracing.horseracingmanagement.module.responsitory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) {

        User user = userRepository
                .findByUsername(identifier)
                .orElseGet(() ->
                        userRepository.findByEmail(identifier)
                                .orElseThrow(() ->
                                        new UsernameNotFoundException(
                                                "User not found: " + identifier
                                        )
                                )
                );

        return new CustomUserDetails(user);
    }
}
