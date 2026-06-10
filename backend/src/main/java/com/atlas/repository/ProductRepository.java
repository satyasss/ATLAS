package com.atlas.repository;

import com.atlas.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySector(String sector);
    List<Product> findBySectorIgnoreCase(String sector);
}
