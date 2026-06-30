package com.atlas.repository;

import com.atlas.model.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String email);
    List<CustomerOrder> findAllByOrderByCreatedAtDesc();
}
