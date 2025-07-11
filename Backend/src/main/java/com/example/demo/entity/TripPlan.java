package com.example.demo.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
@Entity
@Table(name = "trip_plan")
public class TripPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "trip_plan", nullable = false)  // columnDefinition = "jsonb", removed for unit test error
    @JdbcTypeCode(SqlTypes.JSON)
    private String tripPlan;

    @Column(name = "status", nullable = false)
    @Convert(converter = TripStatusConverter.class)
    private TripStatus status = TripStatus.UPCOMING;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = TripStatus.UPCOMING;
        }
    }

    // Helper methods to extract data from JSONB
    public String getDestination() {
        return getStringFromJson("destination", "trip_summary.destination");
    }

    public String getOrigin() {
        return getStringFromJson("origin", "trip_summary.origin");
    }

    public LocalDate getStartDate() {
        try {
            String dateStr = getStringFromJson("start_date", "trip_summary.start_date");
            return dateStr != null ? LocalDate.parse(dateStr) : null;
        } catch (Exception e) {
            System.err.println("Error parsing start date: " + e.getMessage());
            return null;
        }
    }

    public Integer getDurationDays() {
        return getIntFromJson("duration_days", "trip_summary.duration");
    }

    public Double getBudget() {
        return getDoubleFromJson("budget", "trip_summary.total_budget");
    }

    private String getStringFromJson(String... paths) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(tripPlan);

            for (String path : paths) {
                JsonNode node = getNodeByPath(jsonNode, path);
                if (node != null && !node.isNull()) {
                    return node.asText();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error parsing JSON: " + e.getMessage());
            return null;
        }
    }

    private Integer getIntFromJson(String... paths) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(tripPlan);

            for (String path : paths) {
                JsonNode node = getNodeByPath(jsonNode, path);
                if (node != null && !node.isNull()) {
                    return node.asInt();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error parsing JSON: " + e.getMessage());
            return null;
        }
    }

    private Double getDoubleFromJson(String... paths) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(tripPlan);

            for (String path : paths) {
                JsonNode node = getNodeByPath(jsonNode, path);
                if (node != null && !node.isNull()) {
                    return node.asDouble();
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error parsing JSON: " + e.getMessage());
            return null;
        }
    }

    private JsonNode getNodeByPath(JsonNode node, String path) {
        String[] parts = path.split("\\.");
        JsonNode current = node;

        for (String part : parts) {
            if (current == null || current.isNull()) {
                return null;
            }
            current = current.get(part);
        }

        return current;
    }

    // Check if trip is upcoming
    public boolean isUpcoming() {
        LocalDate startDate = getStartDate();
        return startDate != null && startDate.isAfter(LocalDate.now());
    }

    public enum TripStatus {
        UPCOMING("upcoming"),
        RUNNING("running"),
        COMPLETED("completed");

        private final String value;

        TripStatus(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }

        public static TripStatus fromValue(String value) {
            for (TripStatus status : TripStatus.values()) {
                if (status.getValue().equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Unknown status value: " + value);
        }
    }

    @Converter
    public static class TripStatusConverter implements AttributeConverter<TripStatus, String> {

        @Override
        public String convertToDatabaseColumn(TripStatus status) {
            return status != null ? status.getValue() : null;
        }

        @Override
        public TripStatus convertToEntityAttribute(String value) {
            return value != null ? TripStatus.fromValue(value) : null;
        }
    }
}
