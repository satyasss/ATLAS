package com.atlas.controller;

import com.atlas.model.Seller;
import com.atlas.repository.SellerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {
    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

    public SellerController(SellerRepository sellerRepository, PasswordEncoder passwordEncoder) {
        this.sellerRepository = sellerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<SellerResponse> all() {
        return sellerRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    @PostMapping
    public SellerResponse createSeller(@RequestBody SellerCreateRequest request) {
        String email = request.email() == null ? "" : request.email().trim().toLowerCase();
        String mobile = request.mobile() == null ? "" : request.mobile().replaceAll("\\D", "");

        if (email.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required.");
        }
        if (sellerRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A company with this email already exists.");
        }
        if (mobile.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mobile number is required.");
        }
        if (sellerRepository.existsByMobile(mobile)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A company with this mobile number already exists.");
        }
        if (request.businessName() == null || request.businessName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Business name is required.");
        }

        Seller seller = new Seller();
        seller.setBusinessName(request.businessName().trim());
        seller.setOwnerName(request.ownerName() != null && !request.ownerName().isBlank() ? request.ownerName().trim() : "Admin Created");
        seller.setEmail(email);
        seller.setMobile(mobile);
        String rawPassword = request.password() == null || request.password().isBlank() ? "seller123" : request.password();
        seller.setPasswordHash(passwordEncoder.encode(rawPassword));

        seller.setStatus("approved");
        seller.setAadhaarName("admin_created.pdf");
        seller.setAadhaarDataUrl("data:text/plain;base64,YWRtaW4=");
        seller.setBusinessProofName(request.businessProofName());
        seller.setBusinessProofDataUrl(request.businessProofDataUrl());
        seller.setLogoName(request.logoName());
        seller.setLogoDataUrl(request.logoDataUrl());

        return toResponse(sellerRepository.save(seller));
    }

    @PutMapping("/{id}/status")
    public SellerResponse updateStatus(@PathVariable Long id, @RequestBody StatusRequest request) {
        String status = request.status() == null ? "" : request.status().trim().toLowerCase();
        if (!List.of("pending", "approved", "rejected").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid seller status.");
        }
        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller not found."));
        seller.setStatus(status);
        seller.setRejectReason("rejected".equals(status) ? (request.reason() == null ? "Rejected by admin" : request.reason()) : "");
        seller.setUpdatedAt(LocalDateTime.now());
        return toResponse(sellerRepository.save(seller));
    }

    @GetMapping("/approved")
    public List<ApprovedSellerResponse> approvedSellers() {
        return sellerRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(s -> "approved".equalsIgnoreCase(s.getStatus()))
                .map(s -> new ApprovedSellerResponse(s.getId(), s.getBusinessName(), s.getLogoName(), s.getLogoDataUrl(), s.getEmail(), s.getOwnerName()))
                .toList();
    }

    private SellerResponse toResponse(Seller seller) {
        return new SellerResponse(seller.getId(), seller.getBusinessName(), seller.getOwnerName(), seller.getEmail(),
                seller.getMobile(), seller.getStatus(), seller.getRejectReason(), seller.getAadhaarName(),
                seller.getAadhaarDataUrl(), seller.getBusinessProofName(), seller.getBusinessProofDataUrl(),
                seller.getLogoName(), seller.getLogoDataUrl(),
                seller.getCreatedAt(), seller.getUpdatedAt());
    }

    public record StatusRequest(String status, String reason) {}
    public record SellerCreateRequest(String businessName, String ownerName, String email, String mobile, String password,
                                      String businessProofName, String businessProofDataUrl, String logoName, String logoDataUrl) {}
    public record SellerResponse(Long id, String businessName, String ownerName, String email, String mobile,
                                 String status, String rejectReason, String aadhaarName, String aadhaarDataUrl,
                                 String businessProofName, String businessProofDataUrl,
                                 String logoName, String logoDataUrl,
                                 LocalDateTime createdAt, LocalDateTime updatedAt) {}
    public record ApprovedSellerResponse(Long id, String businessName, String logoName, String logoDataUrl, String email, String ownerName) {}
}
