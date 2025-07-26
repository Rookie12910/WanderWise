package com.example.demo.Repository;

import com.example.demo.entity.GroupChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupChatMessageRepository extends JpaRepository<GroupChatMessage, UUID> {
    
    @Query("SELECT gcm FROM GroupChatMessage gcm WHERE gcm.groupTripId = :groupTripId ORDER BY gcm.createdAt ASC")
    List<GroupChatMessage> findByGroupTripIdOrderByCreatedAtAsc(@Param("groupTripId") UUID groupTripId);
    
    @Query("SELECT gcm FROM GroupChatMessage gcm WHERE gcm.groupTripId = :groupTripId ORDER BY gcm.createdAt DESC")
    List<GroupChatMessage> findByGroupTripIdOrderByCreatedAtDesc(@Param("groupTripId") UUID groupTripId);
    
    @Query("SELECT COUNT(gcm) FROM GroupChatMessage gcm WHERE gcm.groupTripId = :groupTripId")
    long countByGroupTripId(@Param("groupTripId") UUID groupTripId);
    
    @Query("SELECT gcm FROM GroupChatMessage gcm WHERE gcm.groupTripId = :groupTripId AND gcm.isPublic = true ORDER BY gcm.createdAt ASC")
    List<GroupChatMessage> findPublicMessagesByGroupTripIdOrderByCreatedAtAsc(@Param("groupTripId") UUID groupTripId);
    
    @Query("SELECT gcm FROM GroupChatMessage gcm WHERE gcm.groupTripId = :groupTripId AND gcm.userId = :userId ORDER BY gcm.createdAt ASC")
    List<GroupChatMessage> findByGroupTripIdAndUserIdOrderByCreatedAtAsc(@Param("groupTripId") UUID groupTripId, @Param("userId") UUID userId);
    
    @Query("SELECT gcm FROM GroupChatMessage gcm WHERE gcm.groupTripId = :groupTripId AND gcm.userId = :userId AND gcm.isPublic = true ORDER BY gcm.createdAt ASC")
    List<GroupChatMessage> findPublicMessagesByGroupTripIdAndUserIdOrderByCreatedAtAsc(@Param("groupTripId") UUID groupTripId, @Param("userId") UUID userId);
}
