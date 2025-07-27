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
@Table(name = "travel_hotels")
public class TravelHotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "spot_id", nullable = false)
    private TravelSpot spot;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "price_min")
    private Integer priceMin;
    public void setSpotId(Integer spotId) {
        this.spot = new TravelSpot();
        this.spot.setId(spotId);
    }
    @Column(name = "price_max")
    private Integer priceMax;

    @Column
    private Double rating;

    private Double lat;
    private Double lon;

    @Column(length = 20)
    private String contact;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // Getters and setters
}