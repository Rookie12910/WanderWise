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

    const fetchGroupTrips = async () => {
      try {
        setIsLoadingGroupTrips(true);
        setGroupTripsError(null);
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

    fetchFeaturedDestinations();
    fetchBlogPosts();
    fetchGroupTrips();
  }, []);

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
                    <b>Budget:</b> ৳{parsedTripPlan?.trip_summary?.total_budget?.toLocaleString() || 'N/A'}
                  </div>
                  <div style={{marginBottom:'1rem',fontSize:'0.98rem',color:'#555'}}>
                    Members: {trip.currentMembers}/{trip.maxPeople}<br/>
                    Created by: {trip.creatorName || 'Unknown'}
                  </div>
                  <div style={{background:'#f8fafc',padding:'18px 0',borderRadius:'10px'}}>
                    <button 
                      className="btn-outline view-details"
                      style={{marginBottom:'10px',width:'90%',fontWeight:'bold'}}
                      onClick={e => { e.stopPropagation(); navigate(`/group-trips/${trip.id}`); }}
                    >
                      View Details
                    </button>
                    <button 
                      className="btn btn-info"
                      style={{marginBottom:'10px',width:'90%'}}
                      onClick={e => { e.stopPropagation(); navigate(`/group-trips/${trip.id}?previewChat=1`); }}
                    >
                      💬 Preview Chat
                    </button>
                    <button 
                      className="btn btn-primary"
                      style={{width:'90%'}}
                      onClick={e => { e.stopPropagation(); navigate(`/group-trips/${trip.id}?join=1`); }}
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
    </div>
  );
};

export default Home;