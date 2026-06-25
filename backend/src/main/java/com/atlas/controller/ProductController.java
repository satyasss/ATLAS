package com.atlas.controller;

import com.atlas.model.Product;
import com.atlas.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/sector/{sector}")
    public List<Product> getBySector(@PathVariable String sector) {
        return productService.getProductsBySector(sector);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product, Authentication authentication) {
        boolean admin = hasRole(authentication, "ROLE_ADMIN");
        product.setCreatedByRole(admin ? "admin" : "seller");
        product.setSellerEmail(authentication.getName());
        product.setSellerName(displayName(authentication));
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product, Authentication authentication) {
        Product existing = productService.getProductById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));
        assertCanManage(existing, authentication);
        product.setCreatedByRole(existing.getCreatedByRole());
        product.setSellerEmail(existing.getSellerEmail());
        product.setSellerName(existing.getSellerName());
        return ResponseEntity.ok(productService.updateProduct(id, product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, Authentication authentication) {
        Product existing = productService.getProductById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found."));
        assertCanManage(existing, authentication);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    private void assertCanManage(Product product, Authentication authentication) {
        if (hasRole(authentication, "ROLE_ADMIN")) return;
        if (product.getSellerEmail() == null || !product.getSellerEmail().equalsIgnoreCase(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only manage your own products.");
        }
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals(role));
    }

    private String displayName(Authentication authentication) {
        if (authentication.getDetails() instanceof io.jsonwebtoken.Claims claims) {
            String name = claims.get("name", String.class);
            if (name != null && !name.isBlank()) return name;
        }
        return authentication.getName();
    }
}
