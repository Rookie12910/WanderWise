import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api, { blogApi, tripApi } from '../api';
import { FaStar } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import '../styles/home-trips.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true); 
  const [error, setError] = useState(null);
  const [blogError, setBlogError] = useState(null); 
  const [groupTrips, setGroupTrips] = useState([]);
  const [isLoadingGroupTrips, setIsLoadingGroupTrips] = useState(true);
  const [groupTripsError, setGroupTripsError] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [showPreviewChat, setShowPreviewChat] = useState(false);
  const [selectedTripForChat, setSelectedTripForChat] = useState(null);
  const [previewChatMessages, setPreviewChatMessages] = useState([]);
  const [newPreviewMessage, setNewPreviewMessage] = useState('');
  const [loadingPreviewChat, setLoadingPreviewChat] = useState(false);
  
  const effectiveUser = currentUser || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null);

  useEffect(() => {
    const fetchFeaturedDestinations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/api/destinations/featured');
        setFeaturedDestinations(response.data || []); 
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching featured destinations:', err);
        setError('Failed to load featured destinations. Please try again later.');
        setFeaturedDestinations([]);
        setIsLoading(false);
      }
    };

    const fetchBlogPosts = async () => {
      try {
        setIsLoadingBlogs(true);
        setBlogError(null);
        const response = await blogApi.getAllBlogPosts();
        setBlogPosts(Array.isArray(response) ? response : []); 
        console.log(`Fetched ${response ? response.length : 0} blog posts`);
        setIsLoadingBlogs(false);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setBlogError('Failed to load blog posts. Please try again later.');
        setBlogPosts([]);
        setIsLoadingBlogs(false);
      }
    };

    fetchFeaturedDestinations();
    fetchBlogPosts();
    fetchGroupTrips();
  }, [effectiveUser]);

  const fetchGroupTrips = async () => {
    try {
      setIsLoadingGroupTrips(true);
      setGroupTripsError(null);
      
      // Check if user is logged in
      if (!effectiveUser) {
        console.log('User not logged in. Skipping group trips fetch.');
        setGroupTrips([]);
        setIsLoadingGroupTrips(false);
        return;
      }
      
      const response = await tripApi.getAvailableGroupTrips();
      setGroupTrips(response && response.data ? response.data : []);
      setIsLoadingGroupTrips(false);
    } catch (err) {
      console.error('Error fetching group trips:', err);
      setGroupTripsError('Failed to load group trips. Please try again later.');
      setGroupTrips([]);
      setIsLoadingGroupTrips(false);
    }
  };

  const navigateToCreateTrip = () => {
    navigate('/create-trip');
  };
  
  const navigateToMyTrips = () => {
    navigate('/my-trips');
  };
  
  const navigateToDestination = (id) => {
    navigate(`/destination/${id}`);
  };

  const navigateToCreateBlog = () => {
    navigate('/create-blog');
  };

  const navigateToBlogPost = (id) => {
    navigate(`/blog/${id}`);
  };

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  const handleViewDetails = async (trip) => {
    try {
      const response = await tripApi.getGroupTripDetails(trip.id);
      if (response.success) {
        setSelectedTrip(response.data);
        setShowTripDetails(true);
      }
    } catch (error) {
      console.error('Error fetching trip details:', error);
    }
  };

  const handleJoinTrip = (trip) => {
    setSelectedTrip(trip);
    setShowJoinModal(true);
    setJoinMessage('');
  };

  const confirmJoinTrip = async () => {
    try {
      const response = await tripApi.joinGroupTrip(selectedTrip.id, { joinMessage });
      if (response.success) {
        alert('Join request sent successfully!');
        setShowJoinModal(false);
        fetchGroupTrips();
      } else {
        alert(response.error || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error joining trip:', error);
      alert('Failed to send join request. Please try again.');
    }
  };

  const handlePreviewChat = async (trip) => {
    setSelectedTripForChat(trip);
    setShowPreviewChat(true);
    loadPreviewChatMessages(trip.id);
  };

  const loadPreviewChatMessages = async (tripId) => {
    try {
      setLoadingPreviewChat(true);
      // Use the public chat endpoint which will include the user's own messages
      const response = await tripApi.getPublicGroupChatMessages(tripId);
      if (response.success) {
        setPreviewChatMessages(response.data);
      } else {
        console.error('Failed to load preview chat messages:', response.error);
      }
    } catch (error) {
      console.error('Error loading preview chat:', error);
    } finally {
      setLoadingPreviewChat(false);
    }
  };
  
  const sendPreviewChatMessage = async () => {
    if (!newPreviewMessage.trim() || !selectedTripForChat) return;
    
    try {
      // Add isPublic flag to message to mark it as viewable by non-members
      const response = await tripApi.sendGroupChatMessage(
        selectedTripForChat.id, 
        newPreviewMessage,
        true // isPublic flag
      );
      
      if (response.success) {
        setNewPreviewMessage('');
        // Reload messages to see the new one
        loadPreviewChatMessages(selectedTripForChat.id);
      }
    } catch (error) {
      console.error('Error sending preview message:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  const parseTrippPlan = (tripPlan) => {
    if (typeof tripPlan === 'string') {
      try {
        return JSON.parse(tripPlan);
      } catch (e) {
        console.error('Failed to parse tripPlan:', e);
        return {};
      }
    }
    return tripPlan || {};
  };

  return (
    <div className="home-container">
      <Navbar />
      
      <div className="welcome-section">
        {effectiveUser ? (
          <h1>Welcome, {effectiveUser.username || effectiveUser.email}!</h1>
        ) : (
          <h1>Welcome to WanderWise!</h1>
        )}
        <p>Discover amazing destinations and plan your perfect trip.</p>
        {effectiveUser && effectiveUser.role === 'ADMIN' ? (
          <div className="action-buttons">
            <button className="btn-primary" onClick={() => navigate('/admin')}>Admin Dashboard</button>
          </div>
        ) : effectiveUser && (
          <div className="action-buttons">
            <button className="btn-primary" onClick={navigateToCreateTrip}>Create New Trip</button>
            <button className="btn-secondary" onClick={navigateToMyTrips}>View My Trips</button>
            <button className="btn-secondary" onClick={() => navigate('/group-trips')}>Browse Group Trips</button>
          </div>
        )}
      </div>
      

      {/* Featured Destinations Section */}
      <div className="featured-section">
        <h2>Featured Destinations</h2>
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading featured destinations...</p>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="destination-cards">
            {featuredDestinations.length > 0 ? (
              featuredDestinations.map(destination => (
                <div className="destination-card" key={destination.id} onClick={() => navigateToDestination(destination.id)}>
                  <div 
                    className="card-image" 
                    style={{ backgroundImage: `url(${destination.imageUrl})` }}
                  ></div>
                  <div className="card-content">
                    <h3>{destination.title}</h3>
                    <p className="destination-location">{destination.destination}</p>
                    <div className="destination-meta">
                      {destination.duration && <span>{destination.duration} days</span>}
                      {destination.avgRating && <span>{destination.avgRating}</span>}
                    </div>
                    <p className="destination-description">{destination.description.substring(0, 100)}...</p>
                    <button 
                      className="btn-outline view-details" 
                      onClick={(e) => { e.stopPropagation(); navigateToDestination(destination.id); }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-trips-message">
                <p>No featured destinations available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Trips Preview Section (Browse Style, 3 max, all buttons) */}
      {effectiveUser ? (
        <div className="featured-section">
          <h2>Group Trips</h2>
          {isLoadingGroupTrips && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading group trips...</p>
            </div>
          )}
          {groupTripsError && (
            <div className="error-message">{groupTripsError}</div>
          )}
          {!isLoadingGroupTrips && !groupTripsError && (
            <div className="destination-cards">
              {groupTrips.length > 0 ? (
                groupTrips.slice(0, 3).map(trip => {
                  let parsedTripPlan = {};
                  if (typeof trip.tripPlan === 'string') {
                    try {
                      parsedTripPlan = JSON.parse(trip.tripPlan);
                    } catch (e) {
                      parsedTripPlan = {};
                    }
                  } else {
                    parsedTripPlan = trip.tripPlan || {};
                  }
                  return (
                    <div className="destination-card" key={trip.id}>
                      <div className="card-content">
                        <h3 style={{textAlign:'center',fontWeight:'bold',fontSize:'1.3rem',marginBottom:'0.5rem'}}>{trip.groupName} <span className={`status-badge ${trip.status ? trip.status.toLowerCase() : ''}`}>{trip.status}</span></h3>
                        <p style={{textAlign:'center',marginBottom:'1rem'}}>{trip.description}</p>
                        <div style={{marginBottom:'1rem'}}>
                          <b>From:</b> {parsedTripPlan?.trip_summary?.origin || 'N/A'}<br/>
                          <b>To:</b> {parsedTripPlan?.trip_summary?.destination || 'N/A'}<br/>
                          <b>Duration:</b> {parsedTripPlan?.trip_summary?.duration || 'N/A'} days<br/>
                          <b>Start Date:</b> {parsedTripPlan?.trip_summary?.start_date || 'N/A'}<br/>
                          <b>Budget per Person:</b> ৳{parsedTripPlan?.trip_summary?.total_budget?.toLocaleString() || 'N/A'}
                        </div>
                        <div style={{marginBottom:'1rem',fontSize:'0.98rem',color:'#555'}}>
                          Members: {trip.currentMembers}/{trip.maxPeople}<br/>
                          Created by: {trip.creatorName || 'Unknown'}
                        </div>
                        <div style={{background:'#f8fafc',padding:'18px 0',borderRadius:'10px'}}>
                          <button 
                            className="btn-outline view-details"
                            style={{marginBottom:'10px',width:'90%',fontWeight:'bold'}}
                            onClick={e => { e.stopPropagation(); handleViewDetails(trip); }}
                          >
                            View Details
                          </button>
                          <button 
                            className="btn btn-info"
                            style={{marginBottom:'10px',width:'90%'}}
                            onClick={e => { e.stopPropagation(); handlePreviewChat(trip); }}
                          >
                            💬 Preview Chat
                          </button>
                          <button 
                            className="btn btn-primary"
                            style={{width:'90%'}}
                            onClick={e => { e.stopPropagation(); handleJoinTrip(trip); }}
                            disabled={trip.status !== 'OPEN'}
                          >
                            Request to Join
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-trips-message">
                  <p>No group trips available at the moment.</p>
                </div>
              )}
            </div>
          )}
          {!isLoadingGroupTrips && !groupTripsError && groupTrips.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => navigate('/group-trips')}>Show All</button>
            </div>
          )}
        </div>
      ) : null}

      {/* Blog Posts Section */}
      <div className="blog-section">
        <h2>Recent Blog Posts</h2>
        
        {isLoadingBlogs && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading blog posts...</p>
          </div>
        )}
        
        {blogError && (
          <div className="error-message">
            {blogError}
          </div>
        )}
        
        {!isLoadingBlogs && !blogError && (
          <div className="blog-cards">
            {blogPosts && Array.isArray(blogPosts) && blogPosts.length > 0 ? (
              blogPosts.map(post => (
                <div className="blog-card" key={post.id} onClick={() => navigateToBlogPost(post.id)}>
                  {post.imageUrl && (
                    <div className="blog-image-wrapper">
                      <img src={post.imageUrl} alt={post.title} className="blog-card-image" />
                    </div>
                  )}
                  <div className="blog-card-content">
                    <h3>{post.title}</h3>
                    <p className="blog-author-date">
                      By {post.username || post.userEmail || 'Anonymous'} on {formatDateTime(post.createdAt)}
                    </p>
                    <p className="blog-snippet">{post.content.substring(0, 150)}...</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="blog-tags">
                        {post.tags.map((tag, idx) => (
                          <span key={idx} className="blog-tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="blog-stats">
                      <span className="stat-item">
                        <span className="stat-icon">❤️</span>
                        <span className="stat-count">{post.likeCount || 0}</span>
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">💬</span>
                        <span className="stat-count">{post.commentCount || 0}</span>
                      </span>
                    </div>

                    <div className="blog-card-actions">
                      <button 
                        className="btn-outline view-details" 
                        onClick={(e) => { e.stopPropagation(); navigateToBlogPost(post.id); }}
                      >
                        Read More
                      </button>
                      
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-trips-message">
                <p>No blog posts available yet. Be the first to share your travel story!</p>
                {effectiveUser && (
                  <button className="btn-primary" onClick={navigateToCreateBlog}>Write Your First Blog</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Trip Details Modal */}
      {showTripDetails && selectedTrip && (
        <div className="trip-details-modal" onClick={() => setShowTripDetails(false)}>
          <div className="trip-details-content" onClick={e => e.stopPropagation()}>
            <div className="details-header">
              <h2>{selectedTrip.groupName}</h2>
              <button 
                className="close-details-btn"
                onClick={() => setShowTripDetails(false)}
              >
                ✕
              </button>
            </div>

            <div className="details-body">
              <div className="trip-overview">
                <h3>Trip Overview</h3>
                <div className="overview-grid">
                  <div className="overview-item">
                    <strong>Destination:</strong>
                    <span>{selectedTrip.tripPlan?.trip_summary?.destination || 'Not specified'}</span>
                  </div>
                  <div className="overview-item">
                    <strong>Origin:</strong>
                    <span>{selectedTrip.tripPlan?.trip_summary?.origin || 'Not specified'}</span>
                  </div>
                  <div className="overview-item">
                    <strong>Duration:</strong>
                    <span>{selectedTrip.tripPlan?.trip_summary?.duration || 'Not specified'} days</span>
                  </div>
                  <div className="overview-item">
                    <strong>Start Date:</strong>
                    <span>{selectedTrip.tripPlan?.trip_summary?.start_date ? 
                           formatDate(selectedTrip.tripPlan.trip_summary.start_date) : 
                           'Not specified'}</span>
                  </div>
                  <div className="overview-item">
                    <strong>Budget per Person:</strong>
                    <span>{selectedTrip.tripPlan?.trip_summary?.total_budget ? 
                           `৳${selectedTrip.tripPlan.trip_summary.total_budget.toLocaleString()}` : 
                           'Not specified'}</span>
                  </div>
                  <div className="overview-item">
                    <strong>Status:</strong>
                    <span className={`status-badge ${selectedTrip.status ? selectedTrip.status.toLowerCase() : ''}`}>
                      {selectedTrip.status}
                    </span>
                  </div>
                  <div className="overview-item">
                    <strong>Members:</strong>
                    <span>{selectedTrip.currentMembers}/{selectedTrip.maxPeople}</span>
                  </div>
                  <div className="overview-item">
                    <strong>Created by:</strong>
                    <span>{selectedTrip.creatorName || 'Unknown'}</span>
                  </div>
                </div>
              </div>

              {/* Budget Breakdown */}
              {selectedTrip.tripPlan?.budget_summary && (
                <div className="budget-section">
                  <h3>Budget Breakdown</h3>
                  <div className="budget-grid">
                    <div className="budget-item">
                      <span>Total Budget:</span>
                      <span>৳{selectedTrip.tripPlan.budget_summary.grand_total?.toLocaleString()}</span>
                    </div>
                    <div className="budget-item">
                      <span>Accommodation:</span>
                      <span>৳{selectedTrip.tripPlan.budget_summary.total_accommodation?.toLocaleString()}</span>
                    </div>
                    <div className="budget-item">
                      <span>Transport:</span>
                      <span>৳{selectedTrip.tripPlan.budget_summary.total_transport?.toLocaleString()}</span>
                    </div>
                    <div className="budget-item">
                      <span>Meals:</span>
                      <span>৳{selectedTrip.tripPlan.budget_summary.total_meals?.toLocaleString()}</span>
                    </div>
                    <div className="budget-item">
                      <span>Activities:</span>
                      <span>৳{selectedTrip.tripPlan.budget_summary.total_activities?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Daily Itinerary */}
              {selectedTrip.tripPlan?.daily_itinerary && (
                <div className="itinerary-section">
                  <h3>Daily Itinerary</h3>
                  <div className="itinerary-timeline">
                    {selectedTrip.tripPlan.daily_itinerary.map((day, index) => (
                      <div key={index} className="day-card">
                        <div className="day-header">
                          <h4>Day {day.day}</h4>
                          <span className="day-date">{formatDate(day.date)}</span>
                          <div className="day-budget">Budget: ৳{day.day_budget?.total?.toLocaleString()}</div>
                        </div>
                        
                        <div className="day-activities">
                          {day.morning_activity && (
                            <div className="activity-item">
                              <div className="activity-time">Morning: {day.morning_activity.time}</div>
                              <div className="activity-name">{day.morning_activity.spot_name}</div>
                              <div className="activity-desc">{day.morning_activity.description}</div>
                            </div>
                          )}
                          
                          {day.lunch_options && day.lunch_options[0] && (
                            <div className="meal-item">
                              <div className="meal-time">Lunch: {day.lunch_options[0].time}</div>
                              <div className="meal-name">{day.lunch_options[0].restaurant_name}</div>
                              <div className="meal-cost">৳{day.lunch_options[0].cost_per_person}</div>
                            </div>
                          )}
                          
                          {day.afternoon_activities && day.afternoon_activities[0] && (
                            <div className="activity-item">
                              <div className="activity-time">Afternoon: {day.afternoon_activities[0].time}</div>
                              <div className="activity-name">{day.afternoon_activities[0].spot_name}</div>
                              <div className="activity-desc">{day.afternoon_activities[0].description}</div>
                            </div>
                          )}
                          
                          {day.dinner_options && day.dinner_options[0] && (
                            <div className="meal-item">
                              <div className="meal-time">Dinner: {day.dinner_options[0].time}</div>
                              <div className="meal-name">{day.dinner_options[0].restaurant_name}</div>
                              <div className="meal-cost">৳{day.dinner_options[0].cost_per_person}</div>
                            </div>
                          )}
                          
                          {day.accommodation_options && day.accommodation_options[0] && (
                            <div className="accommodation-item">
                              <div className="hotel-name">Stay: {day.accommodation_options[0].hotel_name}</div>
                              <div className="hotel-checkin">Check-in: {day.accommodation_options[0].check_in_time}</div>
                              <div className="hotel-cost">৳{day.accommodation_options[0].cost_per_night}/night</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="trip-description-full">{selectedTrip.description}</p>
            </div>

            <div className="details-footer">
              {selectedTrip.status === 'OPEN' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setShowTripDetails(false);
                    handleJoinTrip(selectedTrip);
                  }}
                >
                  Join This Trip
                </button>
              )}
              <button 
                className="btn btn-secondary"
                onClick={() => setShowTripDetails(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Chat Modal */}
      {showPreviewChat && selectedTripForChat && (
        <div className="modal-overlay" onClick={() => setShowPreviewChat(false)}>
          <div className="modal-content chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Public Chat - {selectedTripForChat.groupName}</h3>
              <button 
                className="close-button" 
                onClick={() => setShowPreviewChat(false)}
              >
                ×
              </button>
              <button
                className="refresh-chat-btn"
                style={{ marginLeft: '10px', padding: '4px 10px', fontSize: '14px', cursor: 'pointer' }}
                onClick={() => loadPreviewChatMessages(selectedTripForChat.id)}
                disabled={loadingPreviewChat}
              >
                🔄 Refresh
              </button>
            </div>
            <div className="modal-body chat-body">
              <div className="chat-info-banner">
                <p>💬 This is a public chat where you can ask questions before joining the trip. Messages here are visible to everyone.</p>
              </div>
              
              <div className="chat-messages">
                {loadingPreviewChat ? (
                  <div className="loading-messages">
                    <p>🔄 Loading chat messages...</p>
                  </div>
                ) : previewChatMessages.length === 0 ? (
                  <div className="empty-messages">
                    <p>No messages yet. Be the first to start the conversation!</p>
                  </div>
                ) : (
                  <div className="message-list">
                    {previewChatMessages.map((msg, index) => (
                      <div 
                        key={index} 
                        className={`message-item ${msg.isCurrentUser ? 'my-message' : ''}`}
                      >
                        <div className="message-sender">
                          {msg.senderName || 'Unknown user'}
                          {msg.senderId === selectedTripForChat.createdByUserId && (
                            <span className="creator-badge">👑 Creator</span>
                          )}
                        </div>
                        <div className="message-content">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="chat-input-area">
                <textarea
                  value={newPreviewMessage}
                  onChange={(e) => setNewPreviewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="chat-input"
                />
                <button 
                  className="send-button"
                  onClick={sendPreviewChatMessage}
                  disabled={!newPreviewMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Trip Modal */}
      {showJoinModal && selectedTrip && (
        <div className="join-modal" onClick={() => setShowJoinModal(false)}>
          <div className="join-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Join Group Trip</h3>
            <p>Send a message to the trip creator with your join request:</p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Hi! I'd like to join your trip. Here's a bit about me..."
              className="join-message-input"
              rows="4"
            />
            <div className="join-modal-actions">
              <button 
                className="btn btn-primary"
                onClick={confirmJoinTrip}
              >
                Send Request
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowJoinModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
