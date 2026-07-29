package com.rrtechnosoft.lms.repository;

import com.rrtechnosoft.lms.entity.User;
import com.rrtechnosoft.lms.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByStudentId(String studentId);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByStudentId(String studentId);

    long countByRole(UserRole role);

    long countByStudentIdStartingWith(String prefix);

    Page<User> findByRole(UserRole role, Pageable pageable);

    Page<User> findByRoleAndFullNameContainingIgnoreCase(UserRole role, String name, Pageable pageable);
}
