package com.atlas.service;

import com.atlas.model.CustomerOrder;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OrderMailService {
    private static final Logger log = LoggerFactory.getLogger(OrderMailService.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${app.mail.from-name:Atlas Services}")
    private String fromName;

    public OrderMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOrderConfirmation(CustomerOrder order, List<Map<String, Object>> items) {
        StringBuilder rows = new StringBuilder();
        for (Map<String, Object> item : items) {
            rows.append("<tr><td style='padding:8px;border-bottom:1px solid #e2e8f0'>")
                    .append(escape(String.valueOf(item.get("name"))))
                    .append("</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;text-align:center'>")
                    .append(item.get("quantity"))
                    .append("</td><td style='padding:8px;border-bottom:1px solid #e2e8f0;text-align:right'>₹")
                    .append(item.get("lineTotal"))
                    .append("</td></tr>");
        }

        String body = emailShell("Order confirmed", """
                <p>Hi %s,</p>
                <p>We received your order <strong>#%d</strong>.</p>
                <table style='width:100%%;border-collapse:collapse'>
                  <thead><tr><th style='text-align:left;padding:8px'>Item</th><th>Qty</th><th style='text-align:right;padding:8px'>Amount</th></tr></thead>
                  <tbody>%s</tbody>
                </table>
                <p style='font-size:18px'><strong>Total: ₹%.2f</strong></p>
                <p><strong>Payment:</strong> %s</p>
                <p><strong>Delivery address:</strong><br>%s, %s, %s - %s</p>
                <p>You can follow progress from <strong>My Orders</strong> after signing in.</p>
                """.formatted(escape(order.getFullName()), order.getId(), rows, order.getTotal(),
                paymentLabel(order.getPaymentMethod()), escape(order.getAddressLine1()),
                escape(order.getCity()), escape(order.getState()), escape(order.getPostalCode())));

        send(order.getCustomerEmail(), "Atlas order #" + order.getId() + " confirmed", body);
    }

    public void sendTrackingUpdate(CustomerOrder order) {
        String readableStatus = order.getStatus().replace('_', ' ');
        String body = emailShell("Order update", """
                <p>Hi %s,</p>
                <p>Your order <strong>#%d</strong> is now:</p>
                <div style='padding:16px;background:#eff6ff;border-radius:12px;color:#0b4a9f;font-size:20px;font-weight:800'>%s</div>
                <p><strong>Tracking details:</strong> %s</p>
                <p>Sign in and open <strong>My Orders</strong> for the latest information.</p>
                """.formatted(escape(order.getFullName()), order.getId(), escape(readableStatus),
                escape(order.getTrackingDetails())));
        send(order.getCustomerEmail(), "Atlas order #" + order.getId() + " — " + readableStatus, body);
    }

    private void send(String recipient, String subject, String html) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("Order email skipped because MAIL_FROM or MAIL_USERNAME is missing.");
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress, fromName);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception exception) {
            // The order remains valid even if the mail provider is temporarily unavailable.
            log.error("Could not send order email to {}: {}", recipient, exception.getMessage());
        }
    }

    private String emailShell(String title, String content) {
        return "<div style='background:#f1f5f9;padding:28px;font-family:Arial,sans-serif;color:#0f172a'>"
                + "<div style='max-width:620px;margin:auto;background:#fff;border-radius:18px;overflow:hidden'>"
                + "<div style='background:#0b4a9f;color:#fff;padding:22px 28px'><strong>ATLAS SERVICES</strong><h1 style='margin:8px 0 0'>"
                + escape(title) + "</h1></div><div style='padding:28px;line-height:1.65'>" + content
                + "</div></div></div>";
    }

    private String paymentLabel(String method) {
        return switch (method) {
            case "QR_PAYMENT" -> "Online QR Payment";
            case "UPI_ON_DELIVERY" -> "UPI on Delivery";
            default -> "Cash on Delivery";
        };
    }

    private String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }
}
