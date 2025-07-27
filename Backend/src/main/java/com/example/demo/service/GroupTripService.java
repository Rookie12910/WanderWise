package com.example.demo.service;

import com.example.demo.Repository.TripPlanRepository;
import com.example.demo.Repository.GroupTripMemberRepository;
import com.example.demo.Repository.GroupTripRepository;
import com.example.demo.Repository.UserRepository;
import com.example.demo.Repository.GroupChatMessageRepository;
import com.example.demo.dto.*;
import com.example.demo.entity.TripPlan;
import com.example.demo.entity.GroupTrip;
import com.example.demo.entity.GroupTripMember;
import com.example.demo.entity.User;
import com.example.demo.entity.GroupChatMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupTripService {

    private final GroupTripRepository groupTripRepository;
    private final GroupTripMemberRepository groupTripMemberRepository;
    private final UserRepository userRepository;
    private final TripPlanRepository tripPlanRepository;
    private final GroupChatMessageRepository groupChatMessageRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public ApiResponse<GroupTripResponse> createGroupTrip(CreateGroupTripRequest request, UUID creatorId) {
        try {
            System.out.println("=== DEBUG: Starting group trip creation ===");
            System.out.println("Creator ID: " + creatorId);
            System.out.println("Request: " + request);

            // Step 1: Validate user exists
            System.out.println("Step 1: Checking if user exists...");
            User creator = userRepository.findById(creatorId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + creatorId));
            System.out.println("User found: " + creator.getUsername());

            // Step 2: Basic validation
            System.out.println("Step 2: Validating request data...");
            if (request.getGroupName() == null || request.getGroupName().trim().isEmpty()) {
                System.out.println("ERROR: Group name is missing or empty");
                return ApiResponse.<GroupTripResponse>builder()
                        .success(false)
                        .error("Group name is required")
                        .build();
            }

            if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
                System.out.println("ERROR: Description is missing or empty");
                return ApiResponse.<GroupTripResponse>builder()
                        .success(false)
                        .error("Description is required")
                        .build();
            }

            // Step 3: Validate and get the specific trip plan
            System.out.println("Step 3: Finding specific trip plan with ID: " + request.getTripId());
            
            if (request.getTripId() == null) {
                System.out.println("ERROR: Trip ID is required");
                return ApiResponse.<GroupTripResponse>builder()
                        .success(false)
                        .error("Trip ID is required")
                        .build();
            }

            Optional<TripPlan> tripPlanOpt = tripPlanRepository.findById(request.getTripId());
            if (tripPlanOpt.isEmpty()) {
                System.out.println("ERROR: Trip plan not found with ID: " + request.getTripId());
                return ApiResponse.<GroupTripResponse>builder()
                        .success(false)
                        .error("Trip plan not found with ID: " + request.getTripId())
                        .build();
            }

            TripPlan tripPlan = tripPlanOpt.get();
            
            // Verify that the trip plan belongs to the user creating the group trip
            if (!tripPlan.getUserId().equals(creatorId)) {
                System.out.println("ERROR: Trip plan does not belong to the user");
                return ApiResponse.<GroupTripResponse>builder()
                        .success(false)
                        .error("You can only create group trips from your own trip plans")
                        .build();
            }
            
            System.out.println("Trip plan found: " + tripPlan.getDestination());

            // Step 4: Create group trip entity
            System.out.println("Step 4: Creating group trip entity...");
            Long tripPlanId = tripPlan.getId();
            
            GroupTrip groupTrip = GroupTrip.builder()
                    .groupName(request.getGroupName().trim())
                    .description(request.getDescription().trim())
                    .maxPeople(request.getMaxPeople()) // Use the provided maxPeople value
                    .meetingPoint(request.getMeetingPoint())
                    .additionalRequirements(request.getAdditionalRequirements())
                    .tripPlanId(request.getTripId())
                    .createdByUserId(creatorId)
                    .currentMembers(1)
                    .status(GroupTrip.GroupTripStatus.OPEN)
                    .build();

            System.out.println("Group trip entity created: " + groupTrip.getGroupName());

            // Step 5: Save to database
            System.out.println("Step 5: Saving to database...");
            System.out.println("GroupTrip before save: " + groupTrip);
            System.out.println("Repository: " + groupTripRepository.getClass().getName());
            
            GroupTrip savedGroupTrip;
            try {
                savedGroupTrip = groupTripRepository.save(groupTrip);
                System.out.println("Saved successfully with ID: " + savedGroupTrip.getId());
                System.out.println("Saved GroupTrip: " + savedGroupTrip);
                
                // Verify it's actually in the database
                long count = groupTripRepository.count();
                System.out.println("Total group trips in database: " + count);
                
            } catch (Exception saveException) {
                System.out.println("ERROR during save: " + saveException.getMessage());
                saveException.printStackTrace();
                throw saveException;
            }

            // Step 6: Create response
            System.out.println("Step 6: Creating response...");
            savedGroupTrip.setTripPlan(tripPlan.getTripPlan());

            GroupTripResponse response = GroupTripResponse.builder()
                    .id(savedGroupTrip.getId())
                    .groupName(savedGroupTrip.getGroupName())
                    .description(savedGroupTrip.getDescription())
                    .maxPeople(savedGroupTrip.getMaxPeople())
                    .meetingPoint(savedGroupTrip.getMeetingPoint())
                    .additionalRequirements(savedGroupTrip.getAdditionalRequirements())
                    .createdByUserId(savedGroupTrip.getCreatedByUserId())
                    .creatorName(creator.getUsername())
                    .tripPlanId(savedGroupTrip.getTripPlanId())
                    .tripPlan(tripPlan.getTripPlan())
                    .status(savedGroupTrip.getStatus())
                    .currentMembers(1)
                    .createdAt(savedGroupTrip.getCreatedAt())
                    .updatedAt(savedGroupTrip.getUpdatedAt())
                    .isCreator(true)
                    .hasRequested(false)
                    .memberStatus("CREATOR")
                    .build();

            System.out.println("=== DEBUG: Group trip creation successful ===");
            return ApiResponse.<GroupTripResponse>builder()
                    .success(true)
                    .data(response)
                    .message("Group trip created successfully")
                    .build();

        } catch (Exception e) {
            System.err.println("=== ERROR: Group trip creation failed ===");
            e.printStackTrace();
            return ApiResponse.<GroupTripResponse>builder()
                    .success(false)
                    .error("Failed to create group trip: " + e.getMessage())
                    .build();
        }
    }

    public ApiResponse<List<GroupTripResponse>> getAllAvailableGroupTrips(UUID userId) {
        try {
            List<GroupTrip> groupTrips = groupTripRepository.findAvailableGroupTripsForUser(userId);
            
            List<GroupTripResponse> responses = groupTrips.stream()
                    .map(trip -> convertToResponse(trip, userId))
                    .collect(Collectors.toList());

            return ApiResponse.<List<GroupTripResponse>>builder()
                    .success(true)
                    .data(responses)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<GroupTripResponse>>builder()
                    .success(false)
                    .error("Failed to fetch group trips: " + e.getMessage())
                    .build();
        }
    }

    public ApiResponse<List<GroupTripResponse>> getMyGroupTrips(UUID userId) {
        try {
            // Get trips created by user
            List<GroupTrip> createdTrips = groupTripRepository.findByCreatedByUserIdOrderByCreatedAtDesc(userId);
            
            // Get trips where user is a member (joined or requested)
            List<GroupTripMember> memberEntries = groupTripMemberRepository.findByUserIdOrderByJoinedAtDesc(userId);
            List<GroupTrip> memberTrips = memberEntries.stream()
                    .map(member -> groupTripRepository.findById(member.getGroupTripId()).orElse(null))
                    .filter(trip -> trip != null)
                    .collect(Collectors.toList());
            
            // Combine both lists and remove duplicates
            List<GroupTrip> allTrips = new java.util.ArrayList<>(createdTrips);
            for (GroupTrip memberTrip : memberTrips) {
                if (!allTrips.stream().anyMatch(trip -> trip.getId().equals(memberTrip.getId()))) {
                    allTrips.add(memberTrip);
                }
            }
            
            // Sort by creation date (most recent first)
            allTrips.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
            
            List<GroupTripResponse> responses = allTrips.stream()
                    .map(trip -> convertToResponse(trip, userId))
                    .collect(Collectors.toList());

            return ApiResponse.<List<GroupTripResponse>>builder()
                    .success(true)
                    .data(responses)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<GroupTripResponse>>builder()
                    .success(false)
                    .error("Failed to fetch your group trips: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public ApiResponse<String> joinGroupTrip(UUID groupTripId, JoinGroupTripRequest request, UUID userId) {
        try {
            // Check if group trip exists
            GroupTrip groupTrip = groupTripRepository.findById(groupTripId)
                    .orElseThrow(() -> new RuntimeException("Group trip not found"));

            // Check if user is the creator
            if (groupTrip.getCreatedByUserId().equals(userId)) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .error("You cannot join your own group trip")
                        .build();
            }

            // Check if user already has an active request (REQUESTED or ACCEPTED)
            Optional<GroupTripMember> existingMember = groupTripMemberRepository
                    .findByGroupTripIdAndUserId(groupTripId, userId);
            
            if (existingMember.isPresent()) {
                GroupTripMember.MemberStatus status = existingMember.get().getStatus();
                if (status == GroupTripMember.MemberStatus.REQUESTED) {
                    return ApiResponse.<String>builder()
                            .success(false)
                            .error("You have already requested to join this group trip")
                            .build();
                } else if (status == GroupTripMember.MemberStatus.ACCEPTED) {
                    return ApiResponse.<String>builder()
                            .success(false)
                            .error("You are already a member of this group trip")
                            .build();
                }
                // If status is DECLINED, allow them to request again by updating the existing record
                if (status == GroupTripMember.MemberStatus.DECLINED) {
                    existingMember.get().setStatus(GroupTripMember.MemberStatus.REQUESTED);
                    existingMember.get().setJoinMessage(request.getJoinMessage());
                    existingMember.get().setJoinedAt(LocalDateTime.now()); // Update to current time for new request
                    groupTripMemberRepository.save(existingMember.get());
                    
                    return ApiResponse.<String>builder()
                            .success(true)
                            .message("Join request sent successfully")
                            .build();
                }
            }

            // Create membership request
            GroupTripMember member = GroupTripMember.builder()
                    .groupTripId(groupTripId)
                    .userId(userId)
                    .status(GroupTripMember.MemberStatus.REQUESTED)
                    .joinMessage(request.getJoinMessage())
                    .build();

            groupTripMemberRepository.save(member);

            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Join request sent successfully")
                    .build();

        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .success(false)
                    .error("Failed to join group trip: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public ApiResponse<String> respondToJoinRequest(UUID groupTripId, UUID memberId, boolean approve, UUID creatorId) {
        try {
            // Check if user is the creator of the group trip
            GroupTrip groupTrip = groupTripRepository.findById(groupTripId)
                    .orElseThrow(() -> new RuntimeException("Group trip not found"));

            if (!groupTrip.getCreatedByUserId().equals(creatorId)) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .error("You are not authorized to manage this group trip")
                        .build();
            }

            // Find the membership request
            GroupTripMember member = groupTripMemberRepository.findByGroupTripIdAndUserId(groupTripId, memberId)
                    .orElseThrow(() -> new RuntimeException("Join request not found"));

            if (member.getStatus() != GroupTripMember.MemberStatus.REQUESTED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .error("This request has already been processed")
                        .build();
            }

            // Update member status
            member.setStatus(approve ? GroupTripMember.MemberStatus.ACCEPTED : GroupTripMember.MemberStatus.DECLINED);
            groupTripMemberRepository.save(member);

            String message = approve ? "Member approved successfully" : "Member request rejected";
            return ApiResponse.<String>builder()
                    .success(true)
                    .message(message)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .success(false)
                    .error("Failed to respond to join request: " + e.getMessage())
                    .build();
        }
    }

    public ApiResponse<String> removeMember(UUID groupTripId, UUID memberId, UUID creatorId) {
        try {
            // Check if user is the creator of the group trip
            GroupTrip groupTrip = groupTripRepository.findById(groupTripId)
                    .orElseThrow(() -> new RuntimeException("Group trip not found"));

            if (!groupTrip.getCreatedByUserId().equals(creatorId)) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .error("You are not authorized to manage this group trip")
                        .build();
            }

            // Find the membership
            GroupTripMember member = groupTripMemberRepository.findByGroupTripIdAndUserId(groupTripId, memberId)
                    .orElseThrow(() -> new RuntimeException("Member not found in this group trip"));

            // Make sure we're not removing the creator
            if (memberId.equals(groupTrip.getCreatedByUserId())) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .error("Cannot remove the group trip creator")
                        .build();
            }

            // Allow removing members with any status
            // Delete the member record
            groupTripMemberRepository.delete(member);
            
            // Only update member count if this was an accepted member
            if (member.getStatus() == GroupTripMember.MemberStatus.ACCEPTED) {
                groupTrip.setCurrentMembers(Math.max(1, groupTrip.getCurrentMembers() - 1));
                groupTripRepository.save(groupTrip);
            }
            
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Member removed successfully")
                    .build();

        } catch (Exception e) {
            return ApiResponse.<String>builder()
                    .success(false)
                    .error("Failed to remove member: " + e.getMessage())
                    .build();
        }
    }

    public ApiResponse<GroupTripResponse> getGroupTripDetails(UUID groupTripId, UUID userId) {
        try {
            GroupTrip groupTrip = groupTripRepository.findById(groupTripId)
                    .orElseThrow(() -> new RuntimeException("Group trip not found"));

            GroupTripResponse response = convertToDetailedResponse(groupTrip, userId);

            return ApiResponse.<GroupTripResponse>builder()
                    .success(true)
                    .data(response)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<GroupTripResponse>builder()
                    .success(false)
                    .error("Failed to fetch group trip details: " + e.getMessage())
                    .build();
        }
    }

    public long getGroupTripCount() {
        return groupTripRepository.count();
    }

    private GroupTripResponse convertToResponse(GroupTrip groupTrip, UUID currentUserId) {
        try {
            // Get creator name
            String creatorName = userRepository.findById(groupTrip.getCreatedByUserId())
                    .map(User::getUsername)
                    .orElse("Unknown User");

            // Get trip plan data
            Object tripPlan = null;
            if (groupTrip.getTripPlanId() != null) {
                try {
                    Optional<TripPlan> tripPlanEntity = tripPlanRepository.findById(groupTrip.getTripPlanId());
                    if (tripPlanEntity.isPresent()) {
                        String tripPlanJson = tripPlanEntity.get().getTripPlan();
                        if (tripPlanJson != null && !tripPlanJson.trim().isEmpty()) {
                            tripPlan = objectMapper.readValue(tripPlanJson, Object.class);
                        }
                    }
                } catch (Exception e) {
                    // If parsing fails, try the old way as fallback
                    if (groupTrip.getTripPlan() != null && !groupTrip.getTripPlan().trim().isEmpty()) {
                        try {
                            tripPlan = objectMapper.readValue(groupTrip.getTripPlan(), Object.class);
                        } catch (Exception e2) {
                            tripPlan = groupTrip.getTripPlan();
                        }
                    }
                }
            }

            // Check if current user has requested to join
            Optional<GroupTripMember> memberRequest = groupTripMemberRepository
                    .findByGroupTripIdAndUserId(groupTrip.getId(), currentUserId);

            // Calculate current members dynamically: 1 (creator) + accepted members
            long acceptedMembersCount = groupTripMemberRepository.countAcceptedMembersByGroupTripId(groupTrip.getId());
            int currentMembers = 1 + (int) acceptedMembersCount; // 1 for creator + accepted members

            return GroupTripResponse.builder()
                    .id(groupTrip.getId())
                    .groupName(groupTrip.getGroupName())
                    .description(groupTrip.getDescription())
                    .maxPeople(groupTrip.getMaxPeople())
                    .meetingPoint(groupTrip.getMeetingPoint())
                    .additionalRequirements(groupTrip.getAdditionalRequirements())
                    .createdByUserId(groupTrip.getCreatedByUserId())
                    .creatorName(creatorName)
                    .tripPlanId(groupTrip.getTripPlanId())
                    .tripPlan(tripPlan)
                    .status(groupTrip.getStatus())
                    .currentMembers(currentMembers)
                    .createdAt(groupTrip.getCreatedAt())
                    .updatedAt(groupTrip.getUpdatedAt())
                    .isCreator(groupTrip.getCreatedByUserId().equals(currentUserId))
                    .hasRequested(memberRequest.isPresent())
                    .memberStatus(memberRequest.map(m -> m.getStatus().toString()).orElse(null))
                    .userJoinStatus(groupTrip.getCreatedByUserId().equals(currentUserId) ? "CREATOR" : 
                                   memberRequest.map(m -> m.getStatus().toString()).orElse("NOT_JOINED"))
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to convert group trip to response", e);
        }
    }

    private GroupTripResponse convertToDetailedResponse(GroupTrip groupTrip, UUID currentUserId) {
        GroupTripResponse response = convertToResponse(groupTrip, currentUserId);
        
        // Add member details if user is the creator
        if (groupTrip.getCreatedByUserId().equals(currentUserId)) {
            List<GroupTripMember> members = groupTripMemberRepository.findByGroupTripIdOrderByJoinedAtDesc(groupTrip.getId());
            
            List<GroupTripMemberResponse> memberResponses = members.stream()
                    .map(this::convertToMemberResponse)
                    .collect(Collectors.toList());
            
            response.setMembers(memberResponses);
        } else {
            // If user is not the creator, still include their own member info for viewing their join message
            Optional<GroupTripMember> currentUserMember = groupTripMemberRepository
                    .findByGroupTripIdAndUserId(groupTrip.getId(), currentUserId);
            
            if (currentUserMember.isPresent()) {
                List<GroupTripMemberResponse> memberResponses = List.of(
                    convertToMemberResponse(currentUserMember.get())
                );
                response.setMembers(memberResponses);
            }
        }
        
        return response;
    }

    private GroupTripMemberResponse convertToMemberResponse(GroupTripMember member) {
        User user = userRepository.findById(member.getUserId()).orElse(null);
        
        return GroupTripMemberResponse.builder()
                .id(member.getId())
                .userId(member.getUserId())
                .userName(user != null ? user.getUsername() : "Unknown User")
                .userEmail(user != null ? user.getEmail() : "Unknown Email")
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .joinMessage(member.getJoinMessage())
                .build();
    }

    // ===============================
    // GROUP CHAT METHODS
    // ===============================

    @Transactional(readOnly = true)
    public ApiResponse<List<GroupChatMessageResponse>> getGroupChatMessages(UUID groupTripId, UUID currentUserId) {
        try {
            // Check if user has access to this group trip
            boolean hasAccess = hasAccessToGroupTrip(groupTripId, currentUserId);
            
            List<GroupChatMessage> messages;
            if (hasAccess) {
                // If user has access, show all messages
                messages = groupChatMessageRepository.findByGroupTripIdOrderByCreatedAtAsc(groupTripId);
            } else {
                // If user doesn't have access, show only public messages
                messages = groupChatMessageRepository.findPublicMessagesByGroupTripIdOrderByCreatedAtAsc(groupTripId);
            }
            
            List<GroupChatMessageResponse> response = messages.stream()
                    .map(message -> GroupChatMessageResponse.builder()
                            .id(message.getId())
                            .groupTripId(message.getGroupTripId())
                            .senderId(message.getUserId())
                            .senderName(message.getUserName())
                            .message(message.getMessage())
                            .timestamp(message.getCreatedAt())
                            .isCurrentUser(message.getUserId().equals(currentUserId))
                            .isPublic(message.getIsPublic())
                            .build())
                    .collect(Collectors.toList());

            return ApiResponse.<List<GroupChatMessageResponse>>builder()
                    .success(true)
                    .data(response)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<GroupChatMessageResponse>>builder()
                    .success(false)
                    .error("Failed to load chat messages: " + e.getMessage())
                    .build();
        }
    }
    
    @Transactional(readOnly = true)
    public ApiResponse<List<GroupChatMessageResponse>> getPublicGroupChatMessages(UUID groupTripId, UUID currentUserId) {
        try {
            System.out.println("DEBUG - getPublicGroupChatMessages for user: " + currentUserId + ", group: " + groupTripId);
            
            // Get the group trip creator's ID to ensure we see their messages
            Optional<GroupTrip> groupTripOpt = groupTripRepository.findById(groupTripId);
            if (!groupTripOpt.isPresent()) {
                return ApiResponse.<List<GroupChatMessageResponse>>builder()
                        .success(false)
                        .error("Group trip not found")
                        .build();
            }
            
            UUID creatorId = groupTripOpt.get().getCreatedByUserId();
            System.out.println("DEBUG - Group trip creator ID: " + creatorId);
            
            // Get all public messages for this group trip
            List<GroupChatMessage> publicMessages = groupChatMessageRepository.findPublicMessagesByGroupTripIdOrderByCreatedAtAsc(groupTripId);
            System.out.println("DEBUG - Found " + publicMessages.size() + " public messages");
            
            // Get messages sent by the current user (whether public or not)
            List<GroupChatMessage> currentUserMessages = groupChatMessageRepository.findByGroupTripIdAndUserIdOrderByCreatedAtAsc(groupTripId, currentUserId);
            System.out.println("DEBUG - Found " + currentUserMessages.size() + " messages from current user");
            
            // Get messages sent by the creator (public or not if current user is the creator)
            List<GroupChatMessage> creatorMessages = new ArrayList<>();
            if (!creatorId.equals(currentUserId)) {
                // If current user is not the creator, only get public messages from creator
                creatorMessages = groupChatMessageRepository.findPublicMessagesByGroupTripIdAndUserIdOrderByCreatedAtAsc(groupTripId, creatorId);
                System.out.println("DEBUG - Found " + creatorMessages.size() + " public messages from creator");
            }
            
            // Combine and deduplicate messages
            Set<UUID> messageIds = new HashSet<>();
            List<GroupChatMessage> combinedMessages = new ArrayList<>();
            
            // Add all public messages
            for (GroupChatMessage message : publicMessages) {
                if (!messageIds.contains(message.getId())) {
                    messageIds.add(message.getId());
                    combinedMessages.add(message);
                }
            }
            
            // Add current user's messages that weren't already added
            for (GroupChatMessage message : currentUserMessages) {
                if (!messageIds.contains(message.getId())) {
                    messageIds.add(message.getId());
                    combinedMessages.add(message);
                }
            }
            
            // Add creator's messages that weren't already added
            for (GroupChatMessage message : creatorMessages) {
                if (!messageIds.contains(message.getId())) {
                    messageIds.add(message.getId());
                    combinedMessages.add(message);
                }
            }
            
            // Sort by timestamp
            combinedMessages.sort(Comparator.comparing(GroupChatMessage::getCreatedAt));
            System.out.println("DEBUG - Combined and sorted " + combinedMessages.size() + " messages");
            
            List<GroupChatMessageResponse> response = combinedMessages.stream()
                    .map(message -> GroupChatMessageResponse.builder()
                            .id(message.getId())
                            .groupTripId(message.getGroupTripId())
                            .senderId(message.getUserId())
                            .senderName(message.getUserName())
                            .message(message.getMessage())
                            .timestamp(message.getCreatedAt())
                            .isCurrentUser(message.getUserId().equals(currentUserId))
                            .isPublic(message.getIsPublic())
                            .build())
                    .collect(Collectors.toList());

            return ApiResponse.<List<GroupChatMessageResponse>>builder()
                    .success(true)
                    .data(response)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<GroupChatMessageResponse>>builder()
                    .success(false)
                    .error("Failed to load public chat messages: " + e.getMessage())
                    .build();
        }
    }

    @Transactional
    public ApiResponse<GroupChatMessageResponse> sendGroupChatMessage(UUID groupTripId, SendChatMessageRequest request, UUID currentUserId) {
        try {
            System.out.println("DEBUG - sendGroupChatMessage: Starting to process message");
            System.out.println("DEBUG - Group Trip ID: " + groupTripId);
            System.out.println("DEBUG - User ID: " + currentUserId);
            System.out.println("DEBUG - Request: " + request);
            System.out.println("DEBUG - Message: " + request.getMessage());
            System.out.println("DEBUG - Is Public: " + request.getPublicMessage());
            
            String messageText = request.getMessage();
            Boolean isPublic = request.getPublicMessage() != null ? request.getPublicMessage() : false;
            System.out.println("DEBUG - Extracted isPublic: " + isPublic);
            
            // Check if the user has access to the group trip
            boolean hasAccess = hasAccessToGroupTrip(groupTripId, currentUserId);
            System.out.println("DEBUG - Has Access: " + hasAccess);
            System.out.println("DEBUG - Is Public Message: " + isPublic);
            
            // If user is not a member but message is marked as public, allow it
            if (!hasAccess && !isPublic) {
                System.out.println("DEBUG - Access denied: User doesn't have access and message is not public");
                return ApiResponse.<GroupChatMessageResponse>builder()
                        .success(false)
                        .error("You don't have access to send private messages to this group")
                        .build();
            }
            
            System.out.println("DEBUG - Access check passed, proceeding to create message");

            // Get user info
            Optional<User> userOpt = userRepository.findById(currentUserId);
            String userName = userOpt.map(User::getUsername).orElse("Unknown User");
            System.out.println("DEBUG - Sender username: " + userName);

            // Create and save the message
            GroupChatMessage chatMessage = GroupChatMessage.builder()
                    .groupTripId(groupTripId)
                    .userId(currentUserId)
                    .userName(userName)
                    .message(messageText.trim())
                    .isPublic(isPublic) // Make sure this field is set properly
                    .build();
            
            System.out.println("DEBUG - Chat message object created: " + chatMessage);
            System.out.println("DEBUG - isPublic value in message: " + chatMessage.getIsPublic());

            GroupChatMessage savedMessage = groupChatMessageRepository.save(chatMessage);

            GroupChatMessageResponse response = GroupChatMessageResponse.builder()
                    .id(savedMessage.getId())
                    .groupTripId(savedMessage.getGroupTripId())
                    .senderId(savedMessage.getUserId())
                    .senderName(savedMessage.getUserName())
                    .message(savedMessage.getMessage())
                    .timestamp(savedMessage.getCreatedAt())
                    .isCurrentUser(true)
                    .isPublic(savedMessage.getIsPublic())
                    .build();

            return ApiResponse.<GroupChatMessageResponse>builder()
                    .success(true)
                    .data(response)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<GroupChatMessageResponse>builder()
                    .success(false)
                    .error("Failed to send message: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all members of a group trip (for trip creator to manage)
     */
    public ApiResponse<List<GroupTripMemberResponse>> getGroupTripMembers(UUID groupTripId, UUID creatorId) {
        try {
            // Verify the user is the creator
            GroupTrip groupTrip = groupTripRepository.findById(groupTripId)
                    .orElseThrow(() -> new RuntimeException("Group trip not found"));

            if (!groupTrip.getCreatedByUserId().equals(creatorId)) {
                return ApiResponse.<List<GroupTripMemberResponse>>builder()
                        .success(false)
                        .error("You are not authorized to view group members")
                        .build();
            }

            // Get all members for this group trip
            List<GroupTripMember> members = groupTripMemberRepository.findByGroupTripIdOrderByJoinedAtDesc(groupTripId);
            
            List<GroupTripMemberResponse> memberResponses = members.stream()
                    .map(member -> {
                        // Get user details
                        String userName = "Unknown User";
                        try {
                            Optional<String> userNameOpt = userRepository.findUsernameByUserId(member.getUserId());
                            userName = userNameOpt.orElse("User " + member.getUserId().toString().substring(0, 8));
                        } catch (Exception e) {
                            // Fallback to partial UUID
                            userName = "User " + member.getUserId().toString().substring(0, 8);
                        }

                        return GroupTripMemberResponse.builder()
                                .id(member.getId())
                                .userId(member.getUserId())
                                .userName(userName)
                                .userEmail("") // We can add email lookup later if needed
                                .status(member.getStatus())
                                .joinedAt(member.getJoinedAt())
                                .joinMessage(member.getJoinMessage())
                                .build();
                    })
                    .collect(java.util.stream.Collectors.toList());

            return ApiResponse.<List<GroupTripMemberResponse>>builder()
                    .success(true)
                    .data(memberResponses)
                    .build();

        } catch (Exception e) {
            return ApiResponse.<List<GroupTripMemberResponse>>builder()
                    .success(false)
                    .error("Failed to fetch group members: " + e.getMessage())
                    .build();
        }
    }

    private boolean hasAccessToGroupTrip(UUID groupTripId, UUID userId) {
        System.out.println("DEBUG - Checking access for groupTripId: " + groupTripId + ", userId: " + userId);
        
        // Check if user is the creator
        Optional<GroupTrip> groupTripOpt = groupTripRepository.findById(groupTripId);
        if (groupTripOpt.isPresent() && groupTripOpt.get().getCreatedByUserId().equals(userId)) {
            System.out.println("DEBUG - User is the creator, access granted");
            return true;
        }

        // Check if user is an accepted member
        Optional<GroupTripMember> memberOpt = groupTripMemberRepository.findByGroupTripIdAndUserId(groupTripId, userId);
        boolean isAcceptedMember = memberOpt.isPresent() && memberOpt.get().getStatus() == GroupTripMember.MemberStatus.ACCEPTED;
        System.out.println("DEBUG - User is accepted member: " + isAcceptedMember);
        
        return isAcceptedMember;
    }
}
