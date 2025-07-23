package com.example.demo.Repository;

import com.example.demo.entity.TravelHotel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelHotelRepository extends JpaRepository<TravelHotel,Integer> {
    List<TravelHotel> findBySpot_Id(Integer spotId);
}
