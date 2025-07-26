package com.example.demo.Controller;

import com.example.demo.service.WeatherMonitoringService;
import com.example.demo.entity.TripPlan;
import com.example.demo.Repository.TripPlanRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherMonitoringService weatherMonitoringService;

    @Autowired
    private TripPlanRepository tripPlanRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${python.travel.service.url:http://localhost:5001}")
    private String pythonServiceUrl;

    @GetMapping("/details/{tripId}")
    public ResponseEntity<?> getWeatherDetails(@PathVariable Long tripId) {
        try {
            Map<String, Object> weatherDetails = weatherMonitoringService.getWeatherDetailsForTrip(tripId);
            return ResponseEntity.ok(weatherDetails);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching weather details: " + e.getMessage());
        }
    }

    // New endpoint: Get Gemini-powered weather suggestion for a trip
    @GetMapping("/suggestion/{tripId}")
    public ResponseEntity<?> getWeatherSuggestion(@PathVariable Long tripId) {
        try {
            TripPlan trip = tripPlanRepository.findById(tripId)
                    .orElseThrow(() -> new RuntimeException("Trip not found"));
            Map<String, Object> weatherData = weatherMonitoringService.getWeatherDetailsForTrip(tripId);

            // Prepare request for Python Gemini service
            Map<String, Object> pythonRequest = new java.util.HashMap<>();
            pythonRequest.put("destination", trip.getDestination());
            pythonRequest.put("start_date", trip.getStartDate());
            pythonRequest.put("duration_days", trip.getDurationDays());
            pythonRequest.put("weather_data", weatherData);

            String url = pythonServiceUrl + "/weather-suggestion";
            Map response = restTemplate.postForObject(url, pythonRequest, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error getting weather suggestion: " + e.getMessage());
        }
    }
} 