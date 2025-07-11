package com.example.demo.Controller;

import com.example.demo.dto.FeaturedDestinationDTO;
import com.example.demo.service.FeaturedDestinationService;
import com.example.demo.entity.FeaturedDestination;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/destinations")
public class FeaturedDestinationController {

    private final FeaturedDestinationService featuredDestinationService;

    @Autowired
    public FeaturedDestinationController(FeaturedDestinationService featuredDestinationService) {
        this.featuredDestinationService = featuredDestinationService;
    }

    @GetMapping("/featured")
    public ResponseEntity<List<FeaturedDestination>> getAllFeaturedDestinations() {
        List<FeaturedDestination> destinations = featuredDestinationService.getAllFeaturedDestinations();
        return ResponseEntity.ok(destinations);
    }

   @GetMapping("/{id}")
   public ResponseEntity<FeaturedDestination> getFeaturedDestinationById(@PathVariable UUID id) {
       FeaturedDestination destination = featuredDestinationService.getFeaturedDestinationById(id);
       return ResponseEntity.ok(destination);
   }

}