import React, { useState, useEffect, useContext } from 'react';
import { adminApi, tripApi } from '../api';
import AuthContext from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import CityManager from '../components/CityManager';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [tripStatusData, setTripStatusData] = useState([]);
  const [tripStatusLoading, setTripStatusLoading] = useState(false);
  const [tripStatusSort, setTripStatusSort] = useState({ key: 'city', direction: 'asc' });
  useEffect(() => {
    const fetchTripStatus = async () => {
      if (activeSection !== 'trip-status') return;
      setTripStatusLoading(true);
      try {
        // Fetch all cities
        const cities = await adminApi.getAllCities();
        // Fetch city-status counts for all users (admin)
        const cityStatusCounts = await tripApi.getCityStatusCountsForAllUsers();
        // Build city map for table
        const cityMap = {};
        cities.forEach(city => {
          const counts = cityStatusCounts[city.name] || {};
          cityMap[city.name] = {
            city: city.name,
            running: counts.running || 0,
            upcoming: counts.upcoming || 0,
            completed: counts.completed || 0,
            group: counts.group || 0
          };
        });
        setTripStatusData(Object.values(cityMap));
      } catch (err) {
        setTripStatusData([]);
        setNotification && setNotification({ message: 'Failed to load trip status data', type: 'error' });
      } finally {
        setTripStatusLoading(false);
      }
    };
    fetchTripStatus();
  }, [activeSection]);
  // Sorting for trip status table
  const sortedTripStatusData = React.useMemo(() => {
    const arr = [...tripStatusData];
    arr.sort((a, b) => {
      const { key, direction } = tripStatusSort;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tripStatusData, tripStatusSort]);

  const handleTripStatusSort = (key) => {
    setTripStatusSort(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };
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


// Add edit state and handlers for spot, hotel, restaurant
const [editSpot, setEditSpot] = useState(null);
const [editHotel, setEditHotel] = useState(null);
const [editRestaurant, setEditRestaurant] = useState(null);
// Add showAddSpotForm, showAddHotelForm, showAddRestaurantForm state
const [showAddSpotForm, setShowAddSpotForm] = useState(false);
const [showAddHotelForm, setShowAddHotelForm] = useState(false);
const [showAddRestaurantForm, setShowAddRestaurantForm] = useState(false);

const handleUpdateSpot = async (e) => {
  e.preventDefault();
  if (!editSpot) return;
  try {
    // Map snake_case to camelCase for backend
    const mappedSpot = {
      name: spotForm.name,
      description: spotForm.description,
      entryFee: spotForm.entry_fee,
      timeNeeded: spotForm.time_needed,
      bestTime: spotForm.best_time,
      lat: spotForm.lat,
      lon: spotForm.lon,
      imageUrl: spotForm.image_url
    };
    await adminApi.updateSpot(editSpot.id, mappedSpot);
    // Fetch latest spots from backend
    if (selectedCity) {
      const data = await adminApi.getSpots(selectedCity.id);
      setSpots(data);
    }
    setEditSpot(null);
    setSpotForm({ name: '', description: '', entry_fee: '', time_needed: '', best_time: '', lat: '', lon: '', image_url: '' });
  } catch (err) {
    console.error('Error updating spot:', err);
  }
};

const handleUpdateHotel = async (e) => {
  e.preventDefault();
  if (!editHotel) return;
  try {
    const mappedHotel = {
      name: hotelForm.name,
      priceMin: hotelForm.price_min,
      priceMax: hotelForm.price_max,
      rating: hotelForm.rating,
      lat: hotelForm.lat,
      lon: hotelForm.lon,
      contact: hotelForm.contact,
      imageUrl: hotelForm.image_url,
      spotId: selectedSpot?.id
    };
    const updated = await adminApi.updateHotel(editHotel.id, mappedHotel);
    setHotels(hotels.map(h => h.id === editHotel.id ? updated : h));
    setEditHotel(null);
    setHotelForm({ name: '', price_min: '', price_max: '', rating: '', lat: '', lon: '', contact: '', image_url: '' });
    setNotification({ message: 'Hotel updated successfully!', type: 'success' });
  } catch (err) {
    console.error('Error updating hotel:', err);
    setNotification({ message: 'Failed to update hotel', type: 'error' });
  }
};

const handleUpdateRestaurant = async (e) => {
  e.preventDefault();
  if (!editRestaurant) return;
  try {
    const mappedRestaurant = {
      name: restaurantForm.name,
      popularDishes: restaurantForm.popular_dishes,
      avgCost: restaurantForm.avg_cost,
      lat: restaurantForm.lat,
      lon: restaurantForm.lon,
      imageUrl: restaurantForm.image_url
    };
    const updated = await adminApi.updateRestaurant(editRestaurant.id, mappedRestaurant);
    setRestaurants(restaurants.map(r => r.id === editRestaurant.id ? updated : r));
    setEditRestaurant(null);
    setRestaurantForm({ name: '', popular_dishes: '', avg_cost: '', lat: '', lon: '', image_url: '' });
    setNotification({ message: 'Restaurant updated successfully!', type: 'success' });
  } catch (err) {
    console.error('Error updating restaurant:', err);
    setNotification({ message: 'Failed to update restaurant', type: 'error' });
  }
};

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

const handleUpdateCity = async (e) => {
  e.preventDefault();
  if (!selectedCity) return;
  try {
    const updated = await adminApi.updateCity(selectedCity.id, cityForm);
    setCities(cities.map(city => city.id === selectedCity.id ? updated : city));
    setSelectedCity(updated);
    setCityForm({ name: '', description: '' });
  } catch (err) {
    console.error('Error updating city:', err);
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
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 9999,
          background: notification.type === 'success' ? '#4caf50' : '#f44336',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontWeight: 600,
          fontSize: 16,
        }}>
          {notification.message}
          <button style={{ marginLeft: 16, background: 'transparent', color: '#fff', border: 'none', fontWeight: 700, fontSize: 18, cursor: 'pointer' }} onClick={() => setNotification(null)}>&times;</button>
        </div>
      )}

      {/* Admin Navigation Header */}
      <div className="admin-navigation">
        <div className="admin-nav-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="admin-nav-right">
          <button 
            className="home-btnnn"
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
          Manage Spot
        </button>
        <button
          className={`admin-menu-item ${activeSection === 'trip-status' ? 'active' : ''}`}
          onClick={() => setActiveSection('trip-status')}
        >
          Trip Status by City
        </button>
        {/* Add more menu items here as needed */}
      </div>

      {/* Section Content Below Menu */}
      {activeSection === 'dashboard' && (
        <div className="dashboard-overview">
          <h2>Welcome to the Admin Dashboard</h2>
          <p>Select an option from the menu above to manage different aspects of your website.</p>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Featured Destinations</h3>
              <p className="stat-number">{destinations.length}</p>
            </div>
            {/* ...other stat cards... */}
          </div>
        </div>
      )}

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

      {activeSection === 'blogs' && (
        <div className="section-content">
          {/* ...existing blogs management code... */}
        </div>
      )}

      {activeSection === 'add spot' && (
        <div className="section-content">
          {/* ...existing spot management code... */}
        </div>
      )}

      {activeSection === 'trip-status' && (
        <div className="section-content">
          <div className="section-header">
            <h2>Trips Overview by City</h2>
          </div>
          {tripStatusLoading ? (
            <div className="loading">Loading trip status data...</div>
          ) : (
            <div className="destinations-table-container">
              <table className="destinations-table">
                <thead>
                  <tr>
                    <th style={{cursor:'pointer'}} onClick={() => handleTripStatusSort('city')}>City {tripStatusSort.key==='city' ? (tripStatusSort.direction==='asc'?'▲':'▼') : ''}</th>
                    <th style={{cursor:'pointer'}} onClick={() => handleTripStatusSort('running')}>Running {tripStatusSort.key==='running' ? (tripStatusSort.direction==='asc'?'▲':'▼') : ''}</th>
                    <th style={{cursor:'pointer'}} onClick={() => handleTripStatusSort('upcoming')}>Upcoming {tripStatusSort.key==='upcoming' ? (tripStatusSort.direction==='asc'?'▲':'▼') : ''}</th>
                    <th style={{cursor:'pointer'}} onClick={() => handleTripStatusSort('completed')}>Completed {tripStatusSort.key==='completed' ? (tripStatusSort.direction==='asc'?'▲':'▼') : ''}</th>
                    <th style={{cursor:'pointer'}} onClick={() => handleTripStatusSort('group')}>Group Tour {tripStatusSort.key==='group' ? (tripStatusSort.direction==='asc'?'▲':'▼') : ''}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTripStatusData.length === 0 ? (
                    <tr><td colSpan="5" className="no-destinations">No data found</td></tr>
                  ) : (
                    <>
                      {sortedTripStatusData.map(row => (
                        <tr key={row.city}>
                          <td>{row.city}</td>
                          <td>{row.running}</td>
                          <td>{row.upcoming}</td>
                          <td>{row.completed}</td>
                          <td>{row.group}</td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr style={{ fontWeight: 'bold', background: '#f5f5f5' }}>
                        <td>Total</td>
                        <td>{sortedTripStatusData.reduce((sum, row) => sum + (row.running || 0), 0)}</td>
                        <td>{sortedTripStatusData.reduce((sum, row) => sum + (row.upcoming || 0), 0)}</td>
                        <td>{sortedTripStatusData.reduce((sum, row) => sum + (row.completed || 0), 0)}</td>
                        <td>{sortedTripStatusData.reduce((sum, row) => sum + (row.group || 0), 0)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

    {/* Add New Destination Modal and other modals/content below... */}
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
          {/* Professional City CRUD UI */}
          <CityManager
            cities={cities}
            selectedCity={selectedCity}
            onAdd={async (form) => {
              try {
                const newCity = await adminApi.addCity(form);
                setCities([...cities, newCity]);
              } catch (err) {
                console.error('Error adding city:', err);
              }
            }}
            onUpdate={async (id, form) => {
              try {
                const updated = await adminApi.updateCity(id, form);
                setCities(cities.map(city => city.id === id ? updated : city));
                setSelectedCity(updated);
              } catch (err) {
                console.error('Error updating city:', err);
              }
            }}
            onSelect={setSelectedCity}
          />

          {/* Spots for selected city - CRUD UI */}
          {selectedCity && (
            <div>
              <h3>Spots in {selectedCity.name}</h3>
              {(!editSpot && !showAddSpotForm) && (
                <button
                  style={{
                    marginBottom: 12,
                    background: 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: '0 2px 8px rgba(80,180,255,0.10)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)'}
                  onClick={() => { setShowAddSpotForm(true); setSpotForm({ name: '', description: '', entry_fee: '', time_needed: '', best_time: '', lat: '', lon: '', image_url: '' }); }}
                >
                  ＋ Manage Spot
                </button>
              )}
              {(editSpot || showAddSpotForm) && (
                <form onSubmit={editSpot ? handleUpdateSpot : handleAddSpot} className="travel-form">
                  <input type="text" placeholder="Spot Name" value={spotForm.name} onChange={e => setSpotForm({ ...spotForm, name: e.target.value })} required />
                  <textarea placeholder="Description" value={spotForm.description} onChange={e => setSpotForm({ ...spotForm, description: e.target.value })} required />
                  <input type="number" placeholder="Entry Fee" value={spotForm.entry_fee} onChange={e => setSpotForm({ ...spotForm, entry_fee: e.target.value })} />
                  <input type="number" placeholder="Time Needed (hrs)" value={spotForm.time_needed} onChange={e => setSpotForm({ ...spotForm, time_needed: e.target.value })} />
                  <input type="text" placeholder="Best Time" value={spotForm.best_time} onChange={e => setSpotForm({ ...spotForm, best_time: e.target.value })} />
                  <input type="number" step="any" placeholder="Latitude" value={spotForm.lat} onChange={e => setSpotForm({ ...spotForm, lat: e.target.value })} />
                  <input type="number" step="any" placeholder="Longitude" value={spotForm.lon} onChange={e => setSpotForm({ ...spotForm, lon: e.target.value })} />
                  <input type="text" placeholder="Image URL" value={spotForm.image_url} onChange={e => setSpotForm({ ...spotForm, image_url: e.target.value })} />
                  {editSpot && (
                    <>
                      <button type="submit">Update Spot</button>
                      <button type="button" style={{marginLeft:8,background:'#eee',color:'#333',border:'1px solid #bbb',borderRadius:4,padding:'6px 16px',fontWeight:500}} onClick={() => { setEditSpot(null); setSpotForm({ name: '', description: '', entry_fee: '', time_needed: '', best_time: '', lat: '', lon: '', image_url: '' }); }}>Cancel</button>
                    </>
                  )}
                  {showAddSpotForm && !editSpot && (
                    <>
                      <button type="submit">Add Spot</button>
                      <button type="button" style={{marginLeft:8,background:'#eee',color:'#333',border:'1px solid #bbb',borderRadius:4,padding:'6px 16px',fontWeight:500}} onClick={() => { setShowAddSpotForm(false); setSpotForm({ name: '', description: '', entry_fee: '', time_needed: '', best_time: '', lat: '', lon: '', image_url: '' }); }}>Cancel</button>
                    </>
                  )}
                </form>
              )}
              <ul>
                {spots.map(spot => (
                  <li key={spot.id}>
                    <span style={{marginRight:8}}>{spot.name}</span>
                    <button onClick={() => {
                      console.log('Editing spot:', spot);
                      setEditSpot(spot);
                      setShowAddSpotForm(false);
                      setSpotForm({
                        name: spot.name != null ? String(spot.name) : '',
                        description: spot.description != null ? String(spot.description) : '',
                        entry_fee: spot.entryFee != null ? String(spot.entryFee) : (spot.entry_fee != null ? String(spot.entry_fee) : ''),
                        time_needed: spot.timeNeeded != null ? String(spot.timeNeeded) : (spot.time_needed != null ? String(spot.time_needed) : ''),
                        best_time: spot.bestTime != null ? String(spot.bestTime) : (spot.best_time != null ? String(spot.best_time) : ''),
                        lat: spot.lat != null ? String(spot.lat) : '',
                        lon: spot.lon != null ? String(spot.lon) : '',
                        image_url: spot.imageUrl != null ? String(spot.imageUrl) : (spot.image_url != null ? String(spot.image_url) : '')
                      });
                    }}>Edit</button>
                    <button style={{marginLeft:4}} onClick={async () => { if(window.confirm('Delete this spot?')) { await adminApi.deleteSpot(spot.id); setSpots(spots.filter(s => s.id !== spot.id)); if(selectedSpot && selectedSpot.id === spot.id) setSelectedSpot(null); } }}>Delete</button>
                    <button style={{marginLeft:4}} onClick={() => setSelectedSpot(spot)}>Details</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Hotels and Restaurants for selected spot - CRUD UI */}
          {selectedSpot && (
            <div>
              <h3>Hotels for {selectedSpot.name}</h3>
              {(!editHotel && !showAddHotelForm) && (
                <button
                  style={{
                    marginBottom: 12,
                    background: 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: '0 2px 8px rgba(80,180,255,0.10)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)'}
                  onClick={() => { setShowAddHotelForm(true); setHotelForm({ name: '', price_min: '', price_max: '', rating: '', lat: '', lon: '', contact: '', image_url: '' }); }}
                >
                  ＋ Add Hotel
                </button>
              )}
              {(editHotel || showAddHotelForm) && (
                <form onSubmit={editHotel ? handleUpdateHotel : handleAddHotel} className="travel-form">
                  <input type="text" placeholder="Hotel Name" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} required />
                  <input type="number" placeholder="Price Min" value={hotelForm.price_min} onChange={e => setHotelForm({ ...hotelForm, price_min: e.target.value })} />
                  <input type="number" placeholder="Price Max" value={hotelForm.price_max} onChange={e => setHotelForm({ ...hotelForm, price_max: e.target.value })} />
                  <input type="number" step="any" placeholder="Rating" value={hotelForm.rating} onChange={e => setHotelForm({ ...hotelForm, rating: e.target.value })} />
                  <input type="number" step="any" placeholder="Latitude" value={hotelForm.lat} onChange={e => setHotelForm({ ...hotelForm, lat: e.target.value })} />
                  <input type="number" step="any" placeholder="Longitude" value={hotelForm.lon} onChange={e => setHotelForm({ ...hotelForm, lon: e.target.value })} />
                  <input type="text" placeholder="Contact" value={hotelForm.contact} onChange={e => setHotelForm({ ...hotelForm, contact: e.target.value })} />
                  <input type="text" placeholder="Image URL" value={hotelForm.image_url} onChange={e => setHotelForm({ ...hotelForm, image_url: e.target.value })} />
                  {editHotel && (
                    <>
                      <button type="submit">Update Hotel</button>
                      <button type="button" style={{marginLeft:8,background:'#eee',color:'#333',border:'1px solid #bbb',borderRadius:4,padding:'6px 16px',fontWeight:500}} onClick={() => { setEditHotel(null); setHotelForm({ name: '', price_min: '', price_max: '', rating: '', lat: '', lon: '', contact: '', image_url: '' }); }}>Cancel</button>
                    </>
                  )}
                  {showAddHotelForm && !editHotel && (
                    <>
                      <button type="submit">Add Hotel</button>
                      <button type="button" style={{marginLeft:8,background:'#eee',color:'#333',border:'1px solid #bbb',borderRadius:4,padding:'6px 16px',fontWeight:500}} onClick={() => { setShowAddHotelForm(false); setHotelForm({ name: '', price_min: '', price_max: '', rating: '', lat: '', lon: '', contact: '', image_url: '' }); }}>Cancel</button>
                    </>
                  )}
                </form>
              )}
              <ul>
                {hotels.map(hotel => (
                  <li key={hotel.id}>
                    <span style={{marginRight:8}}>{hotel.name}</span>
                    <button onClick={() => {
                      setEditHotel(hotel);
                      setShowAddHotelForm(false);
                      setHotelForm({
                        name: hotel.name != null ? String(hotel.name) : '',
                        price_min: hotel.priceMin != null ? String(hotel.priceMin) : (hotel.price_min != null ? String(hotel.price_min) : ''),
                        price_max: hotel.priceMax != null ? String(hotel.priceMax) : (hotel.price_max != null ? String(hotel.price_max) : ''),
                        rating: hotel.rating != null ? String(hotel.rating) : '',
                        lat: hotel.lat != null ? String(hotel.lat) : '',
                        lon: hotel.lon != null ? String(hotel.lon) : '',
                        contact: hotel.contact != null ? String(hotel.contact) : '',
                        image_url: hotel.imageUrl != null ? String(hotel.imageUrl) : (hotel.image_url != null ? String(hotel.image_url) : '')
                      });
                    }}>Edit</button>
                    <button style={{marginLeft:4}} onClick={async () => { if(window.confirm('Delete this hotel?')) { await adminApi.deleteHotel(hotel.id); setHotels(hotels.filter(h => h.id !== hotel.id)); } }}>Delete</button>
                  </li>
                ))}
              </ul>
              <h3>Restaurants for {selectedSpot.name}</h3>
              {(!editRestaurant && !showAddRestaurantForm) && (
                <button
                  style={{
                    marginBottom: 12,
                    background: 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '8px 24px',
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: '0 2px 8px rgba(80,180,255,0.10)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38c6ff 0%, #4f8cff 100%)'}
                  onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)'}
                  onClick={() => { setShowAddRestaurantForm(true); setRestaurantForm({ name: '', popular_dishes: '', avg_cost: '', lat: '', lon: '', image_url: '' }); }}
                >
                  ＋ Add Restaurant
                </button>
              )}
              {(editRestaurant || showAddRestaurantForm) && (
                <form onSubmit={editRestaurant ? handleUpdateRestaurant : handleAddRestaurant} className="travel-form">
                  <input type="text" placeholder="Restaurant Name" value={restaurantForm.name} onChange={e => setRestaurantForm({ ...restaurantForm, name: e.target.value })} required />
                  <input type="text" placeholder="Popular Dishes" value={restaurantForm.popular_dishes} onChange={e => setRestaurantForm({ ...restaurantForm, popular_dishes: e.target.value })} />
                  <input type="number" placeholder="Avg Cost" value={restaurantForm.avg_cost} onChange={e => setRestaurantForm({ ...restaurantForm, avg_cost: e.target.value })} />
                  <input type="number" step="any" placeholder="Latitude" value={restaurantForm.lat} onChange={e => setRestaurantForm({ ...restaurantForm, lat: e.target.value })} />
                  <input type="number" step="any" placeholder="Longitude" value={restaurantForm.lon} onChange={e => setRestaurantForm({ ...restaurantForm, lon: e.target.value })} />
                  <input type="text" placeholder="Image URL" value={restaurantForm.image_url} onChange={e => setRestaurantForm({ ...restaurantForm, image_url: e.target.value })} />
                  {editRestaurant && (
                    <>
                      <button type="submit">Update Restaurant</button>
                      <button type="button" style={{marginLeft:8,background:'#eee',color:'#333',border:'1px solid #bbb',borderRadius:4,padding:'6px 16px',fontWeight:500}} onClick={() => { setEditRestaurant(null); setRestaurantForm({ name: '', popular_dishes: '', avg_cost: '', lat: '', lon: '', image_url: '' }); }}>Cancel</button>
                    </>
                  )}
                  {showAddRestaurantForm && !editRestaurant && (
                    <>
                      <button type="submit">Add Restaurant</button>
                      <button type="button" style={{marginLeft:8,background:'#eee',color:'#333',border:'1px solid #bbb',borderRadius:4,padding:'6px 16px',fontWeight:500}} onClick={() => { setShowAddRestaurantForm(false); setRestaurantForm({ name: '', popular_dishes: '', avg_cost: '', lat: '', lon: '', image_url: '' }); }}>Cancel</button>
                    </>
                  )}
                </form>
              )}
              <ul>
                {restaurants.map(rest => (
                  <li key={rest.id}>
                    <span style={{marginRight:8}}>{rest.name}</span>
                    <button onClick={() => {
                      setEditRestaurant(rest);
                      setShowAddRestaurantForm(false);
                      setRestaurantForm({
                        name: rest.name != null ? String(rest.name) : '',
                        popular_dishes: rest.popularDishes != null ? String(rest.popularDishes) : (rest.popular_dishes != null ? String(rest.popular_dishes) : ''),
                        avg_cost: rest.avgCost != null ? String(rest.avgCost) : (rest.avg_cost != null ? String(rest.avg_cost) : ''),
                        lat: rest.lat != null ? String(rest.lat) : '',
                        lon: rest.lon != null ? String(rest.lon) : '',
                        image_url: rest.imageUrl != null ? String(rest.imageUrl) : (rest.image_url != null ? String(rest.image_url) : '')
                      });
                    }}>Edit</button>
                    <button style={{marginLeft:4}} onClick={async () => { if(window.confirm('Delete this restaurant?')) { await adminApi.deleteRestaurant(rest.id); setRestaurants(restaurants.filter(r => r.id !== rest.id)); } }}>Delete</button>
                  </li>
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