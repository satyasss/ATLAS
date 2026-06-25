package com.atlas.controller;

import com.atlas.model.AppUser;
import com.atlas.model.Seller;
import com.atlas.repository.AppUserRepository;
import com.atlas.repository.SellerRepository;
import com.atlas.service.JwtService;
import com.atlas.service.OtpMailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern MOBILE_PATTERN = Pattern.compile("^\\d{10,15}$");

    private final AppUserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final OtpMailService otpMailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.admin.email:}") private String adminEmail;
    @Value("${app.admin.password:}") private String adminPassword;
    @Value("${app.admin.name:Atlas Admin}") private String adminName;

    public AuthController(AppUserRepository userRepository, SellerRepository sellerRepository,
                          OtpMailService otpMailService, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.sellerRepository = sellerRepository;
        this.otpMailService = otpMailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/registration-otp")
    public Map<String, String> sendRegistrationOtp(@RequestBody EmailRequest request) {
        String email = validatedEmail(request.email());
        ensureEmailAvailable(email);
        otpMailService.sendOtp(email, OtpMailService.REGISTRATION);
        return Map.of("message", "OTP sent to " + maskEmail(email));
    }

    @PostMapping("/seller-registration-otp")
    public Map<String, String> sendSellerOtp(@RequestBody EmailRequest request) {
        String email = validatedEmail(request.email());
        ensureEmailAvailable(email);
        otpMailService.sendOtp(email, OtpMailService.SELLER_REGISTRATION);
        return Map.of("message", "Seller verification OTP sent to " + maskEmail(email));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@RequestBody RegisterRequest request) {
        String email = validatedEmail(request.email());
        String mobile = cleanMobile(request.mobile());
        validatePerson(request.name(), mobile, request.password());
        ensureEmailAvailable(email);
        if (userRepository.existsByMobile(mobile) || sellerRepository.existsByMobile(mobile)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this mobile number already exists.");
        }
        otpMailService.verify(email, OtpMailService.REGISTRATION, request.otp());

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setMobile(mobile);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setEmailVerified(true);
        user.setRole("user");
        userRepository.save(user);
        return authResponse(user.getId(), user.getName(), user.getEmail(), user.getMobile(), "user");
    }

    @PostMapping("/register-seller")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> registerSeller(@RequestBody SellerRegisterRequest request) {
        String email = validatedEmail(request.email());
        String mobile = cleanMobile(request.mobile());
        validatePerson(request.ownerName(), mobile, request.password());
        if (request.businessName() == null || request.businessName().trim().length() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter the business name.");
        }
        if (request.aadhaarDataUrl() == null || request.aadhaarDataUrl().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aadhaar document is required.");
        }
        ensureEmailAvailable(email);
        if (userRepository.existsByMobile(mobile) || sellerRepository.existsByMobile(mobile)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this mobile number already exists.");
        }
        otpMailService.verify(email, OtpMailService.SELLER_REGISTRATION, request.otp());

        Seller seller = new Seller();
        seller.setBusinessName(request.businessName().trim());
        seller.setOwnerName(request.ownerName().trim());
        seller.setEmail(email);
        seller.setMobile(mobile);
        seller.setPasswordHash(passwordEncoder.encode(request.password()));
        seller.setAadhaarDataUrl(request.aadhaarDataUrl());
        seller.setAadhaarName(request.aadhaarName());
        seller.setBusinessProofDataUrl(request.businessProofDataUrl());
        seller.setBusinessProofName(request.businessProofName());
        sellerRepository.save(seller);
        return Map.of("message", "Seller application submitted for admin approval.");
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        String email = validatedEmail(request.email());
        String password = request.password() == null ? "" : request.password();

        if (!adminEmail.isBlank() && email.equalsIgnoreCase(adminEmail.trim()) && password.equals(adminPassword)) {
            return authResponse(null, adminName, email, "", "admin");
        }

        var seller = sellerRepository.findByEmailIgnoreCase(email);
        if (seller.isPresent() && passwordEncoder.matches(password, seller.get().getPasswordHash())) {
            Seller account = seller.get();
            if ("pending".equalsIgnoreCase(account.getStatus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your seller account is pending admin approval.");
            }
            if ("rejected".equalsIgnoreCase(account.getStatus())) {
                String reason = account.getRejectReason() == null ? "" : " " + account.getRejectReason();
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Your seller account was rejected." + reason);
            }
            return authResponse(account.getId(), account.getBusinessName(), account.getEmail(), account.getMobile(), "seller");
        }

        AppUser user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return authResponse(user.getId(), user.getName(), user.getEmail(), user.getMobile(), "user");
    }

    @PostMapping("/forgot-password-otp")
    public Map<String, String> sendPasswordResetOtp(@RequestBody EmailRequest request) {
        String email = validatedEmail(request.email());
        if (!userRepository.existsByEmailIgnoreCase(email) && !sellerRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No account was found for this email.");
        }
        otpMailService.sendOtp(email, OtpMailService.PASSWORD_RESET);
        return Map.of("message", "Password reset OTP sent to " + maskEmail(email));
    }

    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@RequestBody ResetPasswordRequest request) {
        String email = validatedEmail(request.email());
        if (request.newPassword() == null || request.newPassword().length() < 8) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
        }
        otpMailService.verify(email, OtpMailService.PASSWORD_RESET, request.otp());
        var user = userRepository.findByEmailIgnoreCase(email);
        if (user.isPresent()) {
            user.get().setPasswordHash(passwordEncoder.encode(request.newPassword()));
            userRepository.save(user.get());
        } else {
            Seller seller = sellerRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found."));
            seller.setPasswordHash(passwordEncoder.encode(request.newPassword()));
            sellerRepository.save(seller);
        }
        return Map.of("message", "Password updated successfully. You can now sign in.");
    }

    private AuthResponse authResponse(Long id, String name, String email, String mobile, String role) {
        return new AuthResponse(id, name, email, mobile, role, jwtService.createToken(email, role, name));
    }

    private void ensureEmailAvailable(String email) {
        if (email.equalsIgnoreCase(adminEmail == null ? "" : adminEmail.trim())
                || userRepository.existsByEmailIgnoreCase(email) || sellerRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
    }

    private String validatedEmail(String email) {
        String clean = email == null ? "" : email.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(clean).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid email address.");
        }
        return clean;
    }

    private String cleanMobile(String mobile) { return mobile == null ? "" : mobile.replaceAll("\\D", ""); }

    private void validatePerson(String name, String mobile, String password) {
        if (name == null || name.trim().length() < 2) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter the full name.");
        if (!MOBILE_PATTERN.matcher(mobile).matches()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid mobile number.");
        if (password == null || password.length() < 8) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 8 characters.");
    }

    private String maskEmail(String email) {
        int at = email.indexOf('@');
        return at <= 2 ? email : email.substring(0, 2) + "***" + email.substring(at);
    }

    public record EmailRequest(String email) {}
    public record RegisterRequest(String name, String mobile, String email, String password, String otp) {}
    public record SellerRegisterRequest(String businessName, String ownerName, String mobile, String email,
                                        String password, String otp, String aadhaarName, String aadhaarDataUrl,
                                        String businessProofName, String businessProofDataUrl) {}
    public record LoginRequest(String email, String password) {}
    public record ResetPasswordRequest(String email, String otp, String newPassword) {}
    public record AuthResponse(Long id, String name, String email, String mobile, String role, String token) {}
}
