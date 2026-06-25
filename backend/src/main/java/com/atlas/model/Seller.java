package com.atlas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sellers", uniqueConstraints = {
        @UniqueConstraint(name = "uk_seller_email", columnNames = "email"),
        @UniqueConstraint(name = "uk_seller_mobile", columnNames = "mobile")
})
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String businessName;
    @Column(nullable = false, length = 120)
    private String ownerName;
    @Column(nullable = false, length = 150)
    private String email;
    @Column(nullable = false, length = 20)
    private String mobile;
    @JsonIgnore
    @Column(nullable = false, length = 100)
    private String passwordHash;
    @Column(nullable = false, length = 20)
    private String status = "pending";
    @Column(length = 500)
    private String rejectReason = "";
    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String aadhaarDataUrl;
    private String aadhaarName;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String businessProofDataUrl;
    private String businessProofName;
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public String getAadhaarDataUrl() { return aadhaarDataUrl; }
    public void setAadhaarDataUrl(String aadhaarDataUrl) { this.aadhaarDataUrl = aadhaarDataUrl; }
    public String getAadhaarName() { return aadhaarName; }
    public void setAadhaarName(String aadhaarName) { this.aadhaarName = aadhaarName; }
    public String getBusinessProofDataUrl() { return businessProofDataUrl; }
    public void setBusinessProofDataUrl(String businessProofDataUrl) { this.businessProofDataUrl = businessProofDataUrl; }
    public String getBusinessProofName() { return businessProofName; }
    public void setBusinessProofName(String businessProofName) { this.businessProofName = businessProofName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
