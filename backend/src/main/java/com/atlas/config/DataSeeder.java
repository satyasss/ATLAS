package com.atlas.config;

import com.atlas.model.Product;
import com.atlas.model.Seller;
import com.atlas.repository.ProductRepository;
import com.atlas.repository.SellerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (sellerRepository.count() == 0) {
            Seller s1 = new Seller();
            s1.setBusinessName("Green Field Organics");
            s1.setOwnerName("Ravi Kumar");
            s1.setEmail("ravi@greenfield.com");
            s1.setMobile("9876543210");
            s1.setPasswordHash(passwordEncoder.encode("password123"));
            s1.setStatus("approved");
            s1.setAadhaarName("aadhaar1.jpg");
            s1.setAadhaarDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
            s1.setLogoName("logo1.png");
            s1.setLogoDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
            sellerRepository.save(s1);

            Seller s2 = new Seller();
            s2.setBusinessName("AgriTools India");
            s2.setOwnerName("Vijay Singh");
            s2.setEmail("vijay@agritools.com");
            s2.setMobile("9876543211");
            s2.setPasswordHash(passwordEncoder.encode("password123"));
            s2.setStatus("approved");
            s2.setAadhaarName("aadhaar2.jpg");
            s2.setAadhaarDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
            s2.setLogoName("logo2.png");
            s2.setLogoDataUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");
            sellerRepository.save(s2);
            System.out.println("✅ Sample sellers seeded.");
        }

        // No dummy products seeded. User requested to remove all dummy product data.
        productRepository.deleteAll();
    }
}
