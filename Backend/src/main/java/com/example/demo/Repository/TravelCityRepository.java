package com.example.demo.Repository;

import com.example.demo.entity.TravelCity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TravelCityRepository extends JpaRepository <TravelCity,Integer> {
}
