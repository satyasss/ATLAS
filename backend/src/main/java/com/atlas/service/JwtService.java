package com.atlas.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    @Value("${app.jwt.secret:}")
    private String secret;
    @Value("${app.jwt.expiry-hours:24}")
    private long expiryHours;

    public String createToken(String email, String role, String name) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claims(Map.of("role", role, "name", name))
                .issuedAt(now)
                .expiration(new Date(now.getTime() + Duration.ofHours(expiryHours).toMillis()))
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }

    private SecretKey key() {
        if (secret == null || secret.length() < 32) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "JWT_SECRET must contain at least 32 characters.");
        }
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
