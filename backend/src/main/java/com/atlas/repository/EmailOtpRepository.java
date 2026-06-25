package com.atlas.repository;

import com.atlas.model.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {
    Optional<EmailOtp> findTopByEmailIgnoreCaseAndPurposeAndUsedFalseOrderByCreatedAtDesc(String email, String purpose);
    void deleteByEmailIgnoreCaseAndPurpose(String email, String purpose);
}
