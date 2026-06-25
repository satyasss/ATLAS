package com.atlas.controller;

import com.atlas.model.Seller;
import com.atlas.repository.SellerRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {
    private final SellerRepository sellerRepository;

    public SellerController(SellerRepository sellerRepository) {
        this.sellerRepository = sellerRepository;
    }

    @GetMapping
    public List<SellerResponse> all() {
        return sellerRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
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

    private SellerResponse toResponse(Seller seller) {
        return new SellerResponse(seller.getId(), seller.getBusinessName(), seller.getOwnerName(), seller.getEmail(),
                seller.getMobile(), seller.getStatus(), seller.getRejectReason(), seller.getAadhaarName(),
                seller.getAadhaarDataUrl(), seller.getBusinessProofName(), seller.getBusinessProofDataUrl(),
                seller.getCreatedAt(), seller.getUpdatedAt());
    }

    public record StatusRequest(String status, String reason) {}
    public record SellerResponse(Long id, String businessName, String ownerName, String email, String mobile,
                                 String status, String rejectReason, String aadhaarName, String aadhaarDataUrl,
                                 String businessProofName, String businessProofDataUrl,
                                 LocalDateTime createdAt, LocalDateTime updatedAt) {}
}
