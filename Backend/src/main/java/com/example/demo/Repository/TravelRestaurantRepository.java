package com.example.demo.Repository;

import com.example.demo.entity.TravelRestaurant;
import jakarta.persistence.Id;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelRestaurantRepository extends JpaRepository<TravelRestaurant, Integer> {
    List<TravelRestaurant> findBySpot_Id(Integer spotId);
}
