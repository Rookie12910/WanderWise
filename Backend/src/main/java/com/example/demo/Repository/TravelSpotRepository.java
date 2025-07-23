package com.example.demo.Repository;

import com.example.demo.entity.TravelSpot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelSpotRepository extends JpaRepository<TravelSpot,Integer> {
     List<TravelSpot> findByCity_Id(Integer cityId);
}
