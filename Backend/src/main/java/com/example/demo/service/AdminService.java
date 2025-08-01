package com.example.demo.service;

import com.example.demo.Repository.FeaturedDestinationRepository;
import com.example.demo.Repository.BlogPostRepository;
import com.example.demo.dto.CreateFeaturedDestinationRequest;
import com.example.demo.dto.BlogPostDTO;
import com.example.demo.entity.FeaturedDestination;
import com.example.demo.entity.BlogPost;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private FeaturedDestinationRepository featuredDestinationRepository;

    @Autowired
    private AdminFileStorageService fileStorageService;
    @Autowired
    private BlogPostRepository blogPostRepository;

    private BlogPostDTO convertToDTO(BlogPost blogPost) {
        return BlogPostDTO.builder()
                .id(blogPost.getId())
                .userId(blogPost.getUserId())
                .title(blogPost.getTitle())
                .content(blogPost.getContent())
                .imageUrl(blogPost.getImageUrl())
                .tags(blogPost.getTags())
                .isPublic(blogPost.isPublic())
                .createdAt(blogPost.getCreatedAt())
                .updatedAt(blogPost.getUpdatedAt())
                .username(blogPost.getUser() != null ? blogPost.getUser().getUsername() : null)
                .userEmail(blogPost.getUser() != null ? blogPost.getUser().getEmail() : null)
                .build();
    }

    /**
     * Get all featured destinations
     * @return List of all featured destinations
     */
    public List<FeaturedDestination> getAllFeaturedDestinations() {
        return featuredDestinationRepository.findAll();
    }

    /**
     * Get a featured destination by ID
     * @param id The ID of the featured destination
     * @return Optional containing the featured destination, or empty if not found
     */
    public Optional<FeaturedDestination> getFeaturedDestinationById(UUID id) {
        return featuredDestinationRepository.findById(id);
    }

    /**
     * Create a new featured destination
     * @param request The request containing the featured destination details
     * @param image The image file for the featured destination
     * @return The created featured destination
     * @throws IOException If the image file cannot be saved
     */
    @Transactional
    public FeaturedDestination createFeaturedDestination(CreateFeaturedDestinationRequest request, MultipartFile image) throws IOException {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Image is required for featured destination");
        }
        
        // Save the image and get the URL
        String imageUrl = fileStorageService.saveDestinationImage(image);

        // Create the featured destination
        FeaturedDestination featuredDestination = FeaturedDestination.builder()
                .destination(request.getDestination())
                .title(request.getTitle())
                .imageUrl(imageUrl)
                .description(request.getDescription())
                .days(request.getDays())
                .avgRating(request.getAvgRating())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .reviews(new String[]{})
                .build();

        // Save and return the entity
        return featuredDestinationRepository.save(featuredDestination);
    }

    /**
     * Toggle the active status of a featured destination
     * @param id The ID of the featured destination
     * @return The updated featured destination
     * @throws RuntimeException if the destination is not found
     */
    @Transactional
    public FeaturedDestination toggleFeaturedDestinationStatus(UUID id) {
        FeaturedDestination destination = featuredDestinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Featured destination not found"));
        
        destination.setActive(!destination.isActive());
        return featuredDestinationRepository.save(destination);
    }

    /**
     * Delete a featured destination
     * @param id The ID of the featured destination
     * @throws RuntimeException if the destination is not found
     */
    @Transactional
    public void deleteFeaturedDestination(UUID id) {
        FeaturedDestination destination = featuredDestinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Featured destination not found"));
        
        // Delete the image file if it exists
        if (destination.getImageUrl() != null && !destination.getImageUrl().isEmpty()) {
            fileStorageService.deleteDestinationImage(destination.getImageUrl());
        }
        
        featuredDestinationRepository.deleteById(id);
    }

    public List<BlogPostDTO> getAllPublicBlogPosts() {
        List<BlogPost> posts = blogPostRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        return posts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteBlogPost(UUID id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("BlogPost not found"));
        
        // Delete the image file if it exists
        if (post.getImageUrl() != null && !post.getImageUrl().isEmpty()) {
            fileStorageService.deleteDestinationImage(post.getImageUrl());
        }
        
        blogPostRepository.deleteById(id);
    }
}
