package com.atlas.service;

import com.atlas.model.EmailOtp;
import com.atlas.repository.EmailOtpRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class OtpMailService {

    public static final String REGISTRATION = "REGISTRATION";
    public static final String SELLER_REGISTRATION = "SELLER_REGISTRATION";
    public static final String PASSWORD_RESET = "PASSWORD_RESET";

    private final EmailOtpRepository otpRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${app.otp.expiry-minutes:10}")
    private long expiryMinutes;

    public OtpMailService(EmailOtpRepository otpRepository, JavaMailSender mailSender, PasswordEncoder passwordEncoder) {
        this.otpRepository = otpRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void sendOtp(String email, String purpose) {
        if (fromAddress == null || fromAddress.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Email service is not configured. Add MAIL_USERNAME, MAIL_APP_PASSWORD and MAIL_FROM on Render.");
        }

        String code = String.format("%06d", random.nextInt(1_000_000));
        otpRepository.deleteByEmailIgnoreCaseAndPurpose(email, purpose);

        EmailOtp otp = new EmailOtp();
        otp.setEmail(email);
        otp.setPurpose(purpose);
        otp.setCodeHash(passwordEncoder.encode(code));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        otpRepository.save(otp);

        try {
            var message = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(email);
            helper.setSubject(purpose.equals(PASSWORD_RESET)
                    ? "Reset your Atlas password"
                    : "Verify your Atlas account");
            helper.setText(buildEmail(code, purpose), true);
            mailSender.send(message);
        } catch (Exception exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "OTP email could not be sent. Check the Render mail credentials.", exception);
        }
    }

    @Transactional
    public void verify(String email, String purpose, String code) {
        EmailOtp otp = otpRepository
                .findTopByEmailIgnoreCaseAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Send an OTP first."));

        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP expired. Request a new code.");
        }
        if (code == null || !passwordEncoder.matches(code.trim(), otp.getCodeHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP.");
        }

        otp.setUsed(true);
        otpRepository.save(otp);
    }

    private String buildEmail(String code, String purpose) {
        String action = purpose.equals(PASSWORD_RESET) ? "reset your password" : "complete your registration";
        return """
                <div style="margin:0;background:#eef4ff;padding:32px;font-family:Arial,sans-serif;color:#0f172a">
                  <div style="max-width:560px;margin:auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,.14)">
                    <div style="padding:26px 30px;background:linear-gradient(135deg,#061b44,#0b4a9f);color:#fff">
                      <div style="font-size:13px;letter-spacing:2px;font-weight:700">ATLAS SERVICES</div>
                      <h1 style="margin:9px 0 0;font-size:24px">Email verification</h1>
                    </div>
                    <div style="padding:30px">
                      <p style="font-size:16px;line-height:1.7;margin-top:0">Use this secure code to %s:</p>
                      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:16px;padding:20px;text-align:center;font-size:34px;font-weight:800;letter-spacing:9px;color:#0b4a9f">%s</div>
                      <p style="color:#64748b;line-height:1.7">This OTP expires in %d minutes. Do not share it with anyone.</p>
                    </div>
                  </div>
                </div>
                """.formatted(action, code, expiryMinutes);
    }
}
