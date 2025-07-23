package com.example.demo.Controller;

import com.example.demo.Repository.TravelCityRepository;
import com.example.demo.Repository.TravelHotelRepository;
import com.example.demo.Repository.TravelRestaurantRepository;
import com.example.demo.Repository.TravelSpotRepository;
import com.example.demo.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/travel")
public class TravelAdminController {

    @Autowired
    private TravelCityRepository cityRepo;
    @Autowired
    private TravelSpotRepository spotRepo;
    @Autowired
    private TravelHotelRepository hotelRepo;
    @Autowired
    private TravelRestaurantRepository restaurantRepo;

    // Get all cities
    @GetMapping("/cities")
    public List<TravelCity> getCities() {
        return cityRepo.findAll();
    }

    // Add a city
    @PostMapping("/cities")
    public ResponseEntity<?> addCity(@RequestBody TravelCity city) {
        cityRepo.save(city);
        return ResponseEntity.ok(city);
    }

    // Get all spots for a city
    @GetMapping("/cities/{cityId}/spots")
    public List<TravelSpot> getSpots(@PathVariable int cityId) {
        return spotRepo.findByCity_Id(cityId);
    }

    // Add a spot to a city
    @PostMapping("/cities/{cityId}/spots")
    public ResponseEntity<?> addSpot(@PathVariable int cityId, @RequestBody TravelSpot spot) {
        if (!cityRepo.existsById(cityId)) {
            return ResponseEntity.badRequest().body("Invalid city_id");
        }
        spot.setCityId(cityId);
        spotRepo.save(spot);
        return ResponseEntity.ok(spot);
    }

    // Get all hotels for a spot
    @GetMapping("/spots/{spotId}/hotels")
    public List<TravelHotel> getHotels(@PathVariable int spotId) {
        return hotelRepo.findBySpot_Id(spotId);
    }

    // Add a hotel to a spot
    @PostMapping("/spots/{spotId}/hotels")
    public ResponseEntity<?> addHotel(@PathVariable int spotId, @RequestBody TravelHotel hotel) {
        if (!spotRepo.existsById(spotId)) {
            return ResponseEntity.badRequest().body("Invalid spot_id");
        }
        hotel.setSpotId(spotId);
        hotelRepo.save(hotel);
        return ResponseEntity.ok(hotel);
    }

    // Get all restaurants for a spot
    @GetMapping("/spots/{spotId}/restaurants")
    public List<TravelRestaurant> getRestaurants(@PathVariable int spotId) {
        return restaurantRepo.findBySpot_Id(spotId);
    }

    // Add a restaurant to a spot
    @PostMapping("/spots/{spotId}/restaurants")
    public ResponseEntity<?> addRestaurant(@PathVariable int spotId, @RequestBody TravelRestaurant restaurant) {
        if (!spotRepo.existsById(spotId)) {
            return ResponseEntity.badRequest().body("Invalid spot_id");
        }
        restaurant.setSpotId(spotId);
        restaurantRepo.save(restaurant);
        return ResponseEntity.ok(restaurant);
    }
}
