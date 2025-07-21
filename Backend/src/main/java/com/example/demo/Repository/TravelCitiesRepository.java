package com.example.demo.Repository;

import com.example.demo.entity.TravelCities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TravelCitiesRepository extends JpaRepository<TravelCities,Long> {
}
