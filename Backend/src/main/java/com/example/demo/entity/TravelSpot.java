package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Entity
@Table(name = "travel_spots")
public class TravelSpot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "city_id", nullable = false)
    private TravelCity city;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    public void setCityId(Integer cityId) {
        this.city = new TravelCity();
        this.city.setId(cityId);
    }
    private String description;


    @Column(name = "entry_fee")
    private Integer entryFee;

    @Column(name = "time_needed")
    private Integer timeNeeded;

    @Column(name = "best_time", length = 100)
    private String bestTime;


    private Double lat;
    private Double lon;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // Getters and setters
}