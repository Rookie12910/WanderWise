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

  useEffect(() => {
    if (activeSection === 'destinations') {
      fetchDestinations();
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

  const handleDelete = async (id) => {
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
            {/* Add more stat cards as needed */}
          </div>
          
          <div className="admin-actions">
            <h3>Administrative Actions</h3>
            <div className="admin-action-buttons">
              <button 
                className="admin-action-btn" 
                onClick={async () => {
                  try {
                    setUpdateStatusLoading(true);
                    const response = await tripApi.triggerAutoStatusUpdate();
                    console.log('Trip status update response:', response);
                    
                    // Show more detailed success message
                    if (response.success) {
                      showNotification(`Trip statuses updated successfully! Check the server logs for details.`, 'success');
                    } else {
                      showNotification(`Update completed but returned unexpected response: ${JSON.stringify(response)}`, 'warning');
                    }
                  } catch (err) {
                    console.error('Error updating trip statuses:', err);
                    
                    // More detailed error message
                    const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
                    const statusCode = err.response?.status;
                    
                    if (statusCode === 403) {
                      showNotification(`Permission denied: ${errorMsg}. Admin privileges required.`, 'error');
                    } else if (statusCode === 401) {
                      showNotification('Authentication error. Please log in again.', 'error');
                    } else {
                      showNotification(`Failed to update trip statuses: ${errorMsg}`, 'error');
                    }
                  } finally {
                    setUpdateStatusLoading(false);
                  }
                }}
                disabled={updateStatusLoading}
              >
                {updateStatusLoading ? 'Updating...' : 'Update Trip Statuses'}
              </button>
              {/* Add more admin action buttons as needed */}
            </div>
            <div className="admin-action-info">
              <p><strong>Update Trip Statuses:</strong> This will check all trips and automatically:</p>
              <ul>
                <li>Change trips from "upcoming" to "running" if the start date has passed but the trip is still ongoing</li>
                <li>Change trips from "running" to "completed" if the end date has passed</li>
              </ul>
              <p><em>Note: Trips must have proper start date and duration information stored in their JSON data.</em></p>
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
                            onClick={() => handleDelete(destination.id)}
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
            <h2>Get Travelled City</h2>
            <button 
              className="add-city-btn" 
              onClick={() => handleData()}
            >
              Add city
            </button>
            <ul className='city-list'>  
              {Object.entries(cityData).map(([name, count], index) => (
                <li key={index}>
                  <strong>{name}:</strong> {count}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;