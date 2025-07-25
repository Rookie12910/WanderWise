import React, { useState, useEffect, useContext } from 'react';
import { adminApi, tripApi } from '../api';
import AuthContext from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [destinations, setDestinations] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form state for new destination
  const [formData, setFormData] = useState({
    destination: '',
    title: '',
    description: '',
    days: '',
    avgRating: '',
    isActive: true
  });
  const [spotData, setSpotData] = useState({
    name: '',
  });
  const [cityData, setCityData] = useState({
    name: '',
    count: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // State for travel data management (add spot section)
  const [cityForm, setCityForm] = useState({ name: '', description: '' });
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [spotForm, setSpotForm] = useState({ name: '', description: '', entry_fee: '', time_needed: '', best_time: '', lat: '', lon: '', image_url: '' });
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [hotelForm, setHotelForm] = useState({ name: '', price_min: '', price_max: '', rating: '', lat: '', lon: '', contact: '', image_url: '' });
  const [hotels, setHotels] = useState([]);
  const [restaurantForm, setRestaurantForm] = useState({ name: '', popular_dishes: '', avg_cost: '', lat: '', lon: '', image_url: '' });
  const [restaurants, setRestaurants] = useState([]);
  // Fetch cities when 'add spot' section is active
  useEffect(() => {
    const fetchCities = async () => {
      try {
        // Replace with your actual API call
        const data = await adminApi.getAllCities();
        setCities(data);
      } catch (err) {
        console.error('Error fetching cities:', err);
      }
    };
    if (activeSection === 'add spot') {
      fetchCities();
    }
  }, [activeSection]);

  // Fetch spots when selectedCity changes
  useEffect(() => {
    const fetchSpots = async () => {
      if (selectedCity) {
        try {
          const data = await adminApi.getSpots(selectedCity.id);
          setSpots(data);
        } catch (err) {
          console.error('Error fetching spots:', err);
        }
      } else {
        setSpots([]);
      }
      setSelectedSpot(null);
      setHotels([]);
      setRestaurants([]);
    };
    fetchSpots();
  }, [selectedCity]);

  // Fetch hotels and restaurants when selectedSpot changes
  useEffect(() => {
    const fetchHotelsAndRestaurants = async () => {
      if (selectedSpot) {
        try {
          const hotelsData = await adminApi.getHotels(selectedSpot.id);
          setHotels(hotelsData);
        } catch (err) {
          console.error('Error fetching hotels:', err);
        }
        try {
          const restaurantsData = await adminApi.getRestaurants(selectedSpot.id);
          setRestaurants(restaurantsData);
        } catch (err) {
          console.error('Error fetching restaurants:', err);
        }
      } else {
        setHotels([]);
        setRestaurants([]);
      }
    };
    fetchHotelsAndRestaurants();
  }, [selectedSpot]);
  // Handler stubs for travel data management
  // Handler implementations for travel data management
  const handleAddCity = async (e) => {
    e.preventDefault();
    try {
      const newCity = await adminApi.addCity(cityForm);
      setCities([...cities, newCity]);
      setCityForm({ name: '', description: '' });
    } catch (err) {
      console.error('Error adding city:', err);
    }
  };

  const handleAddSpot = async (e) => {
    e.preventDefault();
    if (!selectedCity) return;
    try {
      const newSpot = await adminApi.addSpot(selectedCity.id, spotForm);
      setSpots([...spots, newSpot]);
      setSpotForm({ name: '', description: '', entry_fee: '', time_needed: '', best_time: '', lat: '', lon: '', image_url: '' });
    } catch (err) {
      console.error('Error adding spot:', err);
    }
  };

  const handleAddHotel = async (e) => {
    e.preventDefault();
    if (!selectedSpot) return;
    try {
      const newHotel = await adminApi.addHotel(selectedSpot.id, hotelForm);
      setHotels([...hotels, newHotel]);
      setHotelForm({ name: '', price_min: '', price_max: '', rating: '', lat: '', lon: '', contact: '', image_url: '' });
    } catch (err) {
      console.error('Error adding hotel:', err);
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    if (!selectedSpot) return;
    try {
      const newRestaurant = await adminApi.addRestaurant(selectedSpot.id, restaurantForm);
      setRestaurants([...restaurants, newRestaurant]);
      setRestaurantForm({ name: '', popular_dishes: '', avg_cost: '', lat: '', lon: '', image_url: '' });
    } catch (err) {
      console.error('Error adding restaurant:', err);
    }
  };
  useEffect(() => {
    if(activeSection === 'dashboard'){
      fetchDestinations();
      fetchBlogPosts();
    }
    if (activeSection === 'destinations') {
      fetchDestinations();
    }
    if(activeSection === 'blogs'){
      fetchBlogPosts();
    }
  }, [activeSection]);

  // Check if user is admin
  if (currentUser && currentUser.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllFeaturedDestinations();
      setDestinations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllBlogPosts();
      setBlogs(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blog posts', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.destination) errors.destination = 'Destination name is required';
    if (!formData.title) errors.title = 'Title is required';
    if (!formData.description) errors.description = 'Description is required';
    if (!formData.days) errors.days = 'Number of days is required';
    else if (isNaN(formData.days) || parseInt(formData.days) <= 0) 
      errors.days = 'Days must be a positive number';
    
    if (!formData.avgRating) errors.avgRating = 'Average rating is required';
    else if (isNaN(formData.avgRating) || parseFloat(formData.avgRating) <= 0 || parseFloat(formData.avgRating) > 5) 
      errors.avgRating = 'Rating must be a number between 0 and 5';
    
    if (!imageFile) errors.image = 'Image is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleData = async (data) => {
    try {
      const data=await adminApi.addCity();
      setCityData(data||{});
    }catch (err) {
      console.error('Error getting city:', err);
      showNotification('Failed to get city', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      // Prepare form data for API
      const destinationData = {
        ...formData,
        days: parseInt(formData.days),
        avgRating: parseFloat(formData.avgRating)
      };
      
      await adminApi.createFeaturedDestination(destinationData, imageFile);
      
      // Reset form and close modal
      setFormData({
        destination: '',
        title: '',
        description: '',
        days: '',
        avgRating: '',
        isActive: true
      });
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
      
      // Show success notification
      showNotification('Destination added successfully!', 'success');
      
      // Refresh the destinations list
      fetchDestinations();
    } catch (err) {
      console.error('Error creating destination:', err);
      showNotification(err.response?.data?.message || 'Failed to create destination', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      setLoading(true);
      await adminApi.toggleFeaturedDestinationStatus(id);
      showNotification('Destination status updated successfully!', 'success');
      fetchDestinations();
    } catch (err) {
      console.error('Error toggling status:', err);
      showNotification('Failed to update destination status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this destination? This action cannot be undone.')) {
      try {
        setLoading(true);
        await adminApi.deleteFeaturedDestination(id);
        showNotification('Destination deleted successfully!', 'success');
        fetchDestinations();
      } catch (err) {
        console.error('Error deleting destination:', err);
        showNotification('Failed to delete destination', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBlogDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        setLoading(true);
        await adminApi.deleteBlogPost(id);
        showNotification('Blog deleted successfully!', 'success');
        fetchBlogPosts();
      } catch (err) {
        console.error('Error deleting blog:', err);
        showNotification('Failed to delete blog', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleNavigateHome = () => {
    navigate('/');
  };

  if (!currentUser) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      {/* Admin Navigation Header */}
      <div className="admin-navigation">
        <div className="admin-nav-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-nav-right">
          <button 
            className="home-btn"
            onClick={handleNavigateHome}
          >
            Back to Home
          </button>
        </div>
      </div>
      
      {/* Admin Menu */}
      <div className="admin-menu">
        <button 
          className={`admin-menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveSection('dashboard')}
        >
          Dashboard Overview
        </button>
        <button 
          className={`admin-menu-item ${activeSection === 'destinations' ? 'active' : ''}`}
          onClick={() => setActiveSection('destinations')}
        >
          Manage Featured Destinations
        </button>
        
        <button 
          className={`admin-menu-item ${activeSection === 'blogs' ? 'active' : ''}`}
          onClick={() => setActiveSection('blogs')}
        >
          Manage Blog Posts
        </button>

        <button
          className={`admin-menu-item ${activeSection === 'add spot' ? 'active' : ''}`}
          onClick={() => setActiveSection('add spot')}
        >
          Add New Spot
         </button>
         
        {/* Add more menu items here as needed */}
      </div>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Dashboard Content Based on Selected Section */}
      {activeSection === 'dashboard' && (
        <div className="dashboard-overview">
          <h2>Welcome to the Admin Dashboard</h2>
          <p>Select an option from the menu above to manage different aspects of your website.</p>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Featured Destinations</h3>
              <p className="stat-number">{destinations.length}</p>
            </div>

            <div className="stat-card">
              <h3>Blog Posts</h3>
              <p className="stat-number">{blogs.length}</p>
            </div>
          
          </div>
          
        </div>
      )}

      {/* Featured Destinations Management Section */}
      {activeSection === 'destinations' && (
        <div className="section-content">
          <div className="section-header">
            <h2>Manage Featured Destinations</h2>
            <button 
              className="add-destination-btn" 
              onClick={() => setIsModalOpen(true)}
              disabled={loading}
            >
              Add New Destination
            </button>
          </div>
          
          {loading ? (
            <div className="loading">Loading destinations...</div>
          ) : (
            <div className="destinations-table-container">
              <table className="destinations-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Destination</th>
                    <th>Title</th>
                    <th>Days</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {destinations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-destinations">No destinations found</td>
                    </tr>
                  ) : (
                    destinations.map(destination => (
                      <tr key={destination.id} className={(destination.isActive ?? destination.active) ? '' : 'inactive'}>
                        <td>
                          <img 
                            src={`${process.env.PUBLIC_URL}${destination.imageUrl}`} 
                            alt={destination.title} 
                            className="destination-thumbnail" 
                          />
                        </td>
                        <td>{destination.destination}</td>
                        <td>{destination.title}</td>
                        <td>{destination.days}</td>
                        <td>{destination.avgRating.toFixed(1)}</td>
                        <td>
                          <span className={`status-badge ${(destination.isActive ?? destination.active) ? 'active' : 'inactive'}`}>
                            {(destination.isActive ?? destination.active) ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button 
                            className="toggle-status-btn"
                            onClick={() => handleToggleStatus(destination.id)}
                            title={(destination.isActive ?? destination.active) ? "Set Inactive" : "Set Active"}
                          >
                            {(destination.isActive ?? destination.active) ? "Deactivate" : "Activate"}
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDestinationDelete(destination.id)}
                            title="Delete Destination"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Add New Destination Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Featured Destination</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="destination-form">
              <div className="form-group">
                <label htmlFor="destination">Destination Name*</label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.destination && <span className="error">{formErrors.destination}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="title">Title*</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.title && <span className="error">{formErrors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description*</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
                {formErrors.description && <span className="error">{formErrors.description}</span>}
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="days">Number of Days*</label>
                  <input
                    type="number"
                    id="days"
                    name="days"
                    value={formData.days}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                  {formErrors.days && <span className="error">{formErrors.days}</span>}
                </div>

                <div className="form-group half">
                  <label htmlFor="avgRating">Average Rating*</label>
                  <input
                    type="number"
                    id="avgRating"
                    name="avgRating"
                    value={formData.avgRating}
                    onChange={handleInputChange}
                    min="0"
                    max="5"
                    step="0.1"
                    required
                  />
                  {formErrors.avgRating && <span className="error">{formErrors.avgRating}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image">Destination Image*</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  required
                />
                {formErrors.image && <span className="error">{formErrors.image}</span>}
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group checkbox">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive">Set as Active</label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* my addition */}
      {activeSection === 'add spot' && (
        <div className="section-content">
          <div className="section-header">
            <h2>Travel Data Management</h2>
          </div>
          {/* Add City */}
          <form onSubmit={handleAddCity} className="travel-form">
            <h3>Add City</h3>
            <input type="text" placeholder="City Name" value={cityForm.name} onChange={e => setCityForm({ ...cityForm, name: e.target.value })} required />
            <textarea placeholder="Description" value={cityForm.description} onChange={e => setCityForm({ ...cityForm, description: e.target.value })} required />
            <button type="submit">Add City</button>
          </form>
          {/* List Cities */}
          <h3>Cities</h3>
          <ul>
            {cities.map(city => (
              <li key={city.id}>
                <button onClick={() => setSelectedCity(city)}>{city.name}</button>
              </li>
            ))}
          </ul>
          {/* City details */}
          {selectedCity && (
            <div className="city-details">
              <h4>City Details</h4>
              <p><strong>Name:</strong> {selectedCity.name}</p>
              <p><strong>Description:</strong> {selectedCity.description}</p>
              {/* You can add more details here, e.g. spots, etc. */}
            </div>
          )}
          {/* Spots for selected city */}
          {selectedCity && (
            <div>
              <h3>Spots in {selectedCity.name}</h3>
              <form onSubmit={handleAddSpot} className="travel-form">
                <input type="text" placeholder="Spot Name" value={spotForm.name} onChange={e => setSpotForm({ ...spotForm, name: e.target.value })} required />
                <textarea placeholder="Description" value={spotForm.description} onChange={e => setSpotForm({ ...spotForm, description: e.target.value })} required />
                <input type="number" placeholder="Entry Fee" value={spotForm.entry_fee} onChange={e => setSpotForm({ ...spotForm, entry_fee: e.target.value })} />
                <input type="number" placeholder="Time Needed (hrs)" value={spotForm.time_needed} onChange={e => setSpotForm({ ...spotForm, time_needed: e.target.value })} />
                <input type="text" placeholder="Best Time" value={spotForm.best_time} onChange={e => setSpotForm({ ...spotForm, best_time: e.target.value })} />
                <input type="number" step="any" placeholder="Latitude" value={spotForm.lat} onChange={e => setSpotForm({ ...spotForm, lat: e.target.value })} />
                <input type="number" step="any" placeholder="Longitude" value={spotForm.lon} onChange={e => setSpotForm({ ...spotForm, lon: e.target.value })} />
                <input type="text" placeholder="Image URL" value={spotForm.image_url} onChange={e => setSpotForm({ ...spotForm, image_url: e.target.value })} />
                <button type="submit">Add Spot</button>
              </form>
              <ul>
                {spots.map(spot => (
                  <li key={spot.id}>
                    <button onClick={() => setSelectedSpot(spot)}>{spot.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Hotels and Restaurants for selected spot */}
          {selectedSpot && (
            <div>
              <h3>Hotels for {selectedSpot.name}</h3>
              <form onSubmit={handleAddHotel} className="travel-form">
                <input type="text" placeholder="Hotel Name" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} required />
                <input type="number" placeholder="Price Min" value={hotelForm.price_min} onChange={e => setHotelForm({ ...hotelForm, price_min: e.target.value })} />
                <input type="number" placeholder="Price Max" value={hotelForm.price_max} onChange={e => setHotelForm({ ...hotelForm, price_max: e.target.value })} />
                <input type="number" step="any" placeholder="Rating" value={hotelForm.rating} onChange={e => setHotelForm({ ...hotelForm, rating: e.target.value })} />
                <input type="number" step="any" placeholder="Latitude" value={hotelForm.lat} onChange={e => setHotelForm({ ...hotelForm, lat: e.target.value })} />
                <input type="number" step="any" placeholder="Longitude" value={hotelForm.lon} onChange={e => setHotelForm({ ...hotelForm, lon: e.target.value })} />
                <input type="text" placeholder="Contact" value={hotelForm.contact} onChange={e => setHotelForm({ ...hotelForm, contact: e.target.value })} />
                <input type="text" placeholder="Image URL" value={hotelForm.image_url} onChange={e => setHotelForm({ ...hotelForm, image_url: e.target.value })} />
                <button type="submit">Add Hotel</button>
              </form>
              <ul>
                {hotels.map(hotel => (
                  <li key={hotel.id}>{hotel.name}</li>
                ))}
              </ul>
              <h3>Restaurants for {selectedSpot.name}</h3>
              <form onSubmit={handleAddRestaurant} className="travel-form">
                <input type="text" placeholder="Restaurant Name" value={restaurantForm.name} onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} required />
                <input type="text" placeholder="Popular Dishes" value={restaurantForm.popular_dishes} onChange={e => setRestaurantForm({ ...restaurantForm, popular_dishes: e.target.value })} />
                <input type="number" placeholder="Avg Cost" value={restaurantForm.avg_cost} onChange={e => setRestaurantForm({ ...restaurantForm, avg_cost: e.target.value })} />
                <input type="number" step="any" placeholder="Latitude" value={restaurantForm.lat} onChange={e => setRestaurantForm({ ...restaurantForm, lat: e.target.value })} />
                <input type="number" step="any" placeholder="Longitude" value={restaurantForm.lon} onChange={e => setRestaurantForm({ ...restaurantForm, lon: e.target.value })} />
                <input type="text" placeholder="Image URL" value={restaurantForm.image_url} onChange={e => setRestaurantForm({ ...restaurantForm, image_url: e.target.value })} />
                <button type="submit">Add Restaurant</button>
              </form>
              <ul>
                {restaurants.map(rest => (
                  <li key={rest.id}>{rest.name}</li>
                ))}
              </ul>
              </div>
          )}
        </div>
      )}


      {/* Blog Posts Management Section */}
       {activeSection === 'blogs' && (
        <div className="section-content">
          <div className="section-header">
            <h2>Manage Blog Posts</h2>
          </div>
          
          {loading ? (
            <div className="loading">Loading blog posts...</div>
          ) : (
            <div className="destinations-table-container">
              <table className="destinations-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Author's Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="no-destinations">No blog posts found</td>
                    </tr>
                  ) : (
                    blogs.map(blog => (
                      <tr key={blog.id} className=''>
                        <td>
                          <img 
                            src={`${process.env.PUBLIC_URL}${blog.imageUrl}`} 
                            alt={blog.title} 
                            className="blog-thumbnail" 
                          />
                        </td>
                        <td>{blog.title}</td>
                        <td>{blog.username}</td>
                        <td>{blog.userEmail}</td>
                        <td>
                          <button 
                            className="delete-btn"
                            onClick={() => handleBlogDelete(blog.id)}
                            title="Delete Destination"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
    
);
};

export default AdminDashboard;