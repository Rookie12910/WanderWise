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
@Table(name = "travel_restaurants")
public class TravelRestaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "spot_id", nullable = false)
    private TravelSpot spot;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    public void setSpotId(Integer spotId) {
        this.spot = new TravelSpot();
        this.spot.setId(spotId);
    }
    @Column(name = "popular_dishes")
    private String popularDishes;

    @Column(name = "avg_cost")
    private Integer avgCost;
    private Double lat;
    private Double lon;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    // Getters and setters
}