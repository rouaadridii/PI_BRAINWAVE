package com.example.claimmanagementpi.repository;

import com.example.claimmanagementpi.entities.User;
import com.example.claimmanagementpi.entities.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByRole(UserRole role);
}
