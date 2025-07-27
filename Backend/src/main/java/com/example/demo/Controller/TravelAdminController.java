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

    // Update a city
    @PutMapping("/cities/{cityId}")
    public ResponseEntity<?> updateCity(@PathVariable Integer cityId, @RequestBody TravelCity updatedCity) {
        return cityRepo.findById(cityId)
                .map(city -> {
                    city.setName(updatedCity.getName());
                    city.setDescription(updatedCity.getDescription());
                    cityRepo.save(city);
                    return ResponseEntity.ok(city);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
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

    // Update a spot
    @PutMapping("/spots/{spotId}")
    public ResponseEntity<?> updateSpot(@PathVariable Integer spotId, @RequestBody TravelSpot updatedSpot) {
        return spotRepo.findById(spotId)
                .map(spot -> {
                    spot.setName(updatedSpot.getName());
                    spot.setDescription(updatedSpot.getDescription());
                    spot.setEntryFee(updatedSpot.getEntryFee());
                    spot.setTimeNeeded(updatedSpot.getTimeNeeded());
                    spot.setBestTime(updatedSpot.getBestTime());
                    spot.setLat(updatedSpot.getLat());
                    spot.setLon(updatedSpot.getLon());
                    spotRepo.save(spot);
                    return ResponseEntity.ok(spot);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a spot
    @DeleteMapping("/spots/{spotId}")
    public ResponseEntity<?> deleteSpot(@PathVariable Integer spotId) {
        if (!spotRepo.existsById(spotId)) {
            return ResponseEntity.notFound().build();
        }
        spotRepo.deleteById(spotId);
        return ResponseEntity.ok().build();
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

    // Update a hotel
    @PutMapping("/hotels/{hotelId}")
    public ResponseEntity<?> updateHotel(@PathVariable Integer hotelId, @RequestBody TravelHotel updatedHotel) {
        return hotelRepo.findById(hotelId)
                .map(hotel -> {
                    hotel.setName(updatedHotel.getName());
                    hotel.setPriceMin(updatedHotel.getPriceMin());
                    hotel.setPriceMax(updatedHotel.getPriceMax());
                    hotel.setRating(updatedHotel.getRating());
                    hotel.setLat(updatedHotel.getLat());
                    hotel.setLon(updatedHotel.getLon());
                    hotel.setContact(updatedHotel.getContact());
                    hotel.setImageUrl(updatedHotel.getImageUrl());
                    // Ensure spot is set (avoid null constraint)
                    if (updatedHotel.getSpot() != null && updatedHotel.getSpot().getId() != null) {
                        hotel.setSpotId(updatedHotel.getSpot().getId());
                    }
                    hotelRepo.save(hotel);
                    return ResponseEntity.ok(hotel);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a hotel
    @DeleteMapping("/hotels/{hotelId}")
    public ResponseEntity<?> deleteHotel(@PathVariable Integer hotelId) {
        if (!hotelRepo.existsById(hotelId)) {
            return ResponseEntity.notFound().build();
        }
        hotelRepo.deleteById(hotelId);
        return ResponseEntity.ok().build();
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

    // Update a restaurant
    @PutMapping("/restaurants/{restaurantId}")
    public ResponseEntity<?> updateRestaurant(@PathVariable Integer restaurantId, @RequestBody TravelRestaurant updatedRestaurant) {
        return restaurantRepo.findById(restaurantId)
                .map(restaurant -> {
                    restaurant.setName(updatedRestaurant.getName());
                    restaurant.setPopularDishes(updatedRestaurant.getPopularDishes());
                    restaurant.setAvgCost(updatedRestaurant.getAvgCost());
                    restaurant.setLat(updatedRestaurant.getLat());
                    restaurant.setLon(updatedRestaurant.getLon());
                    restaurant.setImageUrl(updatedRestaurant.getImageUrl());
                    restaurantRepo.save(restaurant);
                    return ResponseEntity.ok(restaurant);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete a restaurant
    @DeleteMapping("/restaurants/{restaurantId}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Integer restaurantId) {
        if (!restaurantRepo.existsById(restaurantId)) {
            return ResponseEntity.notFound().build();
        }
        restaurantRepo.deleteById(restaurantId);
        return ResponseEntity.ok().build();
    }
}
