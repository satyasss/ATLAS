package com.atlas.service;

import com.atlas.model.EmailOtp;
import com.atlas.repository.EmailOtpRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class OtpMailService {

    private static final Logger log = LoggerFactory.getLogger(OtpMailService.class);
    private static final String BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

    public static final String REGISTRATION        = "REGISTRATION";
    public static final String SELLER_REGISTRATION = "SELLER_REGISTRATION";
    public static final String PASSWORD_RESET       = "PASSWORD_RESET";

    private final EmailOtpRepository otpRepository;
    private final PasswordEncoder    passwordEncoder;
    private final SecureRandom       random = new SecureRandom();
    private final HttpClient         httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${app.mail.from-name:Atlas Services}")
    private String fromName;

    @Value("${app.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.otp.expiry-minutes:10}")
    private long expiryMinutes;

    public OtpMailService(EmailOtpRepository otpRepository,
                          PasswordEncoder passwordEncoder) {
        this.otpRepository   = otpRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void sendOtp(String email, String purpose) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        otpRepository.deleteByEmailIgnoreCaseAndPurpose(email, purpose);

        EmailOtp otp = new EmailOtp();
        otp.setEmail(email);
        otp.setPurpose(purpose);
        otp.setCodeHash(passwordEncoder.encode(code));
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(expiryMinutes));
        otpRepository.save(otp);

        if (brevoApiKey == null || brevoApiKey.isBlank() || fromAddress == null || fromAddress.isBlank()) {
            log.warn("OTP email not configured: BREVO_API_KEY or MAIL_FROM is missing. Falling back to console logging.");
            log.warn("\n==========================================\n" +
                     " DEVELOPMENT OTP for " + email + ": " + code + "\n" +
                     "==========================================\n");
            return;
        }

        try {
            sendViaBrevo(email, code, purpose);
            log.info("OTP email sent successfully to {} via Brevo", email);
        } catch (Exception ex) {
            log.error("OTP email failed for {}: {}", email, ex.getMessage());
            log.warn("\n==========================================\n" +
                     " DEVELOPMENT OTP for " + email + ": " + code + "\n" +
                     "==========================================\n");
        }
    }

    private void sendViaBrevo(String toEmail, String code, String purpose) throws Exception {
        String subject = purpose.equals(PASSWORD_RESET) ? "Reset your Atlas password" : "Verify your Atlas account";
        String htmlContent = buildEmail(code, purpose);

        String payload = """
                {
                  "sender": { "name": "%s", "email": "%s" },
                  "to": [ { "email": "%s" } ],
                  "subject": "%s",
                  "htmlContent": "%s"
                }
                """.formatted(
                jsonEscape(fromName),
                jsonEscape(fromAddress),
                jsonEscape(toEmail),
                jsonEscape(subject),
                jsonEscape(htmlContent)
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BREVO_ENDPOINT))
                .header("accept", "application/json")
                .header("api-key", brevoApiKey)
                .header("content-type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("Brevo API responded with " + response.statusCode() + ": " + response.body());
        }
    }

    private String jsonEscape(String value) {
        if (value == null) return "";
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
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
                """.replace("\n", "").formatted(action, code, expiryMinutes);
    }
}
