package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupTripRequest {
    private String groupName;
    private String description;
    private Integer maxPeople;
    private String meetingPoint;
    private String additionalRequirements;
    private Object tripPlan; // Can be any JSON structure
    private Long tripId; // ID of the specific trip plan to associate with the group trip
    
    @Override
    public String toString() {
        return "CreateGroupTripRequest{" +
                "groupName='" + groupName + '\'' +
                ", description='" + description + '\'' +
                ", maxPeople=" + maxPeople +
                ", meetingPoint='" + meetingPoint + '\'' +
                ", additionalRequirements='" + additionalRequirements + '\'' +
                ", tripPlan=" + tripPlan +
                ", tripId=" + tripId +
                '}';
    }
}
