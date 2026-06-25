package com.atlas.controller;

import com.atlas.model.CustomerOrder;
import com.atlas.model.Product;
import com.atlas.repository.AppUserRepository;
import com.atlas.repository.CustomerOrderRepository;
import com.atlas.repository.ProductRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final CustomerOrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final AppUserRepository userRepository;
    private final ObjectMapper objectMapper;

    public OrderController(CustomerOrderRepository orderRepository, ProductRepository productRepository,
                           AppUserRepository userRepository, ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public OrderResponse createOrder(@RequestBody OrderRequest request, Authentication authentication) {
        String email = authentication.getName();
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Please sign in with a registered customer account.");
        }
        validateAddress(request);
        if (request.items() == null || request.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Your cart is empty.");
        }

        List<Map<String, Object>> savedItems = new ArrayList<>();
        double total = 0;
        for (OrderItemRequest item : request.items()) {
            int quantity = item.quantity() == null ? 0 : item.quantity();
            if (quantity < 1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid item quantity.");

            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "A product in your cart no longer exists."));
            int stock = product.getStock() == null ? 0 : product.getStock();
            if (stock < quantity) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, product.getName() + " does not have enough stock.");
            }

            double lineTotal = product.getPrice() * quantity;
            total += lineTotal;
            savedItems.add(Map.of(
                    "productId", product.getId(),
                    "name", product.getName(),
                    "price", product.getPrice(),
                    "quantity", quantity,
                    "lineTotal", lineTotal
            ));
            product.setStock(stock - quantity);
            productRepository.save(product);
        }

        CustomerOrder order = new CustomerOrder();
        order.setCustomerEmail(email);
        order.setFullName(request.fullName().trim());
        order.setPhone(request.phone().replaceAll("\\D", ""));
        order.setAddressLine1(request.addressLine1().trim());
        order.setAddressLine2(request.addressLine2() == null ? "" : request.addressLine2().trim());
        order.setCity(request.city().trim());
        order.setState(request.state().trim());
        order.setPostalCode(request.postalCode().trim());
        order.setPaymentMethod(normalizePaymentMethod(request.paymentMethod()));
        order.setTotal(Math.round(total * 100.0) / 100.0);
        try {
            order.setItemsJson(objectMapper.writeValueAsString(savedItems));
        } catch (JsonProcessingException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not prepare the order.", exception);
        }
        CustomerOrder saved = orderRepository.save(order);
        return new OrderResponse(saved.getId(), saved.getStatus(), saved.getTotal(), saved.getCreatedAt().toString());
    }

    @GetMapping
    public List<CustomerOrder> getCustomerOrders(@RequestParam(required = false) String email, Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        String targetEmail = admin && email != null && !email.isBlank() ? email.trim() : authentication.getName();
        return orderRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(targetEmail);
    }

    private void validateAddress(OrderRequest request) {
        if (isBlank(request.fullName()) || isBlank(request.phone()) || isBlank(request.addressLine1())
                || isBlank(request.city()) || isBlank(request.state()) || isBlank(request.postalCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete all required delivery address fields.");
        }
        String phone = request.phone().replaceAll("\\D", "");
        if (phone.length() < 10 || phone.length() > 15) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid delivery phone number.");
        }
        if (!request.postalCode().trim().matches("^[A-Za-z0-9 -]{4,12}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid postal code.");
        }
    }

    private String normalizePaymentMethod(String method) {
        String normalized = method == null ? "" : method.trim().toUpperCase();
        if (!normalized.equals("COD") && !normalized.equals("UPI_ON_DELIVERY")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose Cash on Delivery or UPI on Delivery.");
        }
        return normalized;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public record OrderItemRequest(Long productId, Integer quantity) {}
    public record OrderRequest(String customerEmail, String fullName, String phone, String addressLine1,
                               String addressLine2, String city, String state, String postalCode,
                               String paymentMethod, List<OrderItemRequest> items) {}
    public record OrderResponse(Long orderId, String status, Double total, String createdAt) {}
}
