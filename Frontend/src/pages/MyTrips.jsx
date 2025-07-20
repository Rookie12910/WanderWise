// Frontend/src/pages/MyTrips.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { tripApi } from '../api'; // <-- Import tripApi
import TripDetailsModal from '../components/TripDetailsModal';
import GroupTripRequestModal from '../components/GroupTripRequestModal';
import NotificationCenter from '../components/NotificationCenter';
import '../styles/trips.css';

const MyTrips = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [categorizedTrips, setCategorizedTrips] = useState({
    running: [],
    upcoming: [],
    completed: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState('running');
  const [showGroupTripModal, setShowGroupTripModal] = useState(false);
  const [selectedTripForGroup, setSelectedTripForGroup] = useState(null);
  
  useEffect(() => {
    const fetchTrips = async () => {
      if (currentUser) {
        try {
          const response = await tripApi.getCategorizedTrips();
          if (response.success) {
            setCategorizedTrips(response.data);
          } else {
            setError(response.error || 'Failed to fetch trips');
          }
        } catch (error) {
          console.error("Failed to fetch trips", error);
          setError('Network error. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, [currentUser]);

  // Handle viewing trip details
  const handleViewDetails = (trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTrip(null);
  };

  // Handle deleting a trip
  const handleDeleteTrip = async (tripId, tripDestination) => {
    if (!window.confirm(`Are you sure you want to delete the trip to ${tripDestination}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      console.log('🗑️ Attempting to delete trip with ID:', tripId);
      console.log('🔍 Trip ID type:', typeof tripId);
      
      const response = await tripApi.deleteTripPlan(tripId);
      console.log('📡 Delete API response:', response);
      
      // Check for successful deletion
      if (response && (response.success === true || response.message === "Trip deleted successfully")) {
        // Remove trip from all categories
        setCategorizedTrips(currentTrips => ({
          running: currentTrips.running.filter(trip => trip.id !== tripId),
          upcoming: currentTrips.upcoming.filter(trip => trip.id !== tripId),
          completed: currentTrips.completed.filter(trip => trip.id !== tripId)
        }));
        console.log('✅ Trip deleted successfully from database and UI');
        
        // Show success message
        alert(`✅ Trip to ${tripDestination} has been deleted successfully!`);
      } else {
        console.warn('⚠️ Unexpected response format:', response);
        throw new Error(response?.error || response?.message || 'Unexpected response from server');
      }
    } catch (error) {
      console.error('❌ Delete trip error details:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Show user-friendly error message based on specific error types
      if (error.response?.status === 404) {
        alert('❌ Trip not found. It may have already been deleted.');
        // Remove from state anyway since it doesn't exist
        setCategorizedTrips(currentTrips => ({
          running: currentTrips.running.filter(trip => trip.id !== tripId),
          upcoming: currentTrips.upcoming.filter(trip => trip.id !== tripId),
          completed: currentTrips.completed.filter(trip => trip.id !== tripId)
        }));
      } else if (error.response?.status === 403) {
        alert('❌ You do not have permission to delete this trip.');
      } else if (error.response?.status === 401) {
        alert('❌ Authentication required. Please log in again.');
      } else if (error.response?.status >= 500) {
        alert('❌ Server error. Please try again later.');
      } else if (error.message.includes('Network Error')) {
        alert('❌ Network error. Please check your connection and try again.');
      } else {
        // More detailed error message for debugging
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        alert(`❌ Failed to delete trip: ${errorMsg}. Please try again or contact support.`);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle group trip request
  const handleRequestGroupTrip = (trip) => {
    setSelectedTripForGroup(trip);
    setShowGroupTripModal(true);
  };

  // Handle group trip creation
  const handleCreateGroupTrip = async (groupTripData) => {
    try {
      console.log('Creating group trip with data:', groupTripData);
      console.log('Stringified data:', JSON.stringify(groupTripData, null, 2));
      
      // Make API call to create group trip (using simple API for testing)
      const response = await tripApi.createGroupTripSimple(groupTripData);
      
      console.log('API Response:', response);
      
      if (response.success) {
        alert('🎉 Group trip created successfully! Other users can now see and join your trip.');
      } else {
        throw new Error(response.error || 'Failed to create group trip');
      }
    } catch (error) {
      console.error('Error creating group trip:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error; // Re-throw to be handled by the modal
    }
  };

  const handleLogin = () => {
    navigate('/auth/login');
  };

  // Render trip card
  const renderTripCard = (trip) => {
    // Extract trip summary data from the nested structure
    const tripSummary = trip.tripPlan?.trip_summary || {};
    const destination = tripSummary.destination || trip.tripPlan?.destination || 'Unknown Destination';
    const duration = tripSummary.duration || trip.tripPlan?.duration_days || null;
    const budget = tripSummary.total_budget || trip.tripPlan?.budget || null;
    const startDate = tripSummary.start_date || trip.tripPlan?.start_date || null;
    const origin = tripSummary.origin || trip.tripPlan?.origin || null;
    
    return (
      <div key={trip.id} className="trip-card">
        <div className="trip-info">
          <h3>{destination}</h3>
          <p className="trip-details">
            {duration ? `${duration} days` : 'Duration not specified'}
            {budget && ` • Budget: ৳${budget.toLocaleString()}`}
          </p>
          <p className="trip-dates">
            Accepted: {new Date(trip.createdAt).toLocaleDateString()}
            {startDate && ` • Start: ${startDate}`}
          </p>
          {origin && (
            <p className="trip-transport">
              From: {origin} → To: {destination}
            </p>
          )}
        </div>
        <div className="trip-actions">
          <button 
            className="btn-outline"
            onClick={() => handleViewDetails(trip)}
            disabled={isDeleting}
          >
            View Details
          </button>
          <button 
            className="btn-group-trip"
            onClick={() => handleRequestGroupTrip(trip)}
            disabled={isDeleting}
            title="Create a group trip for others to join"
          >
            Request Group Trip
          </button>
          <button 
            className="btn-danger"
            onClick={() => handleDeleteTrip(trip.id, destination)}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    );
  };

  // Get total count of all trips
  const getTotalTripsCount = () => {
    return categorizedTrips.running.length + categorizedTrips.upcoming.length + categorizedTrips.completed.length;
  };

  if (!currentUser) {
    return (
      <div className="auth-dialog-overlay">
        <div className="auth-dialog">
          <h2>Authentication Required</h2>
          <p>You need to login first to view your trips.</p>
          <div className="auth-dialog-actions">
            <button onClick={handleLogin} className="btn-primary">Login</button>
            <button onClick={() => navigate('/')} className="btn-outline">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="logo">WanderWise</div>
        <div className="nav-buttons">
          <NotificationCenter />
          <button onClick={() => navigate('/')} className="btn-outline">Back to Home</button>
        </div>
      </header>
      
      <div className="content-container">
        <div className="trips-header">
          <h1>My Accepted Trips</h1>
          <button onClick={() => navigate('/travel-planner')} className="btn-primary">
            Plan New Trip
          </button>
        </div>
        
        {isLoading ? (
          <div className="loading-container">
            <p>Loading your accepted trips...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : getTotalTripsCount() > 0 ? (
          <div className="trips-container">
            {/* Tabs for different trip categories */}
            <div className="trip-tabs">
              <button 
                className={`tab-button ${activeTab === 'running' ? 'active' : ''}`}
                onClick={() => setActiveTab('running')}
              >
                Running Tours ({categorizedTrips.running.length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'upcoming' ? 'active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming Tours ({categorizedTrips.upcoming.length})
              </button>
              <button 
                className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed Tours ({categorizedTrips.completed.length})
              </button>
            </div>

            {/* Trip content based on active tab */}
            <div className="trips-list">
              {activeTab === 'running' && (
                <div className="trip-section">
                  {categorizedTrips.running.length > 0 ? (
                    categorizedTrips.running.map(trip => renderTripCard(trip))
                  ) : (
                    <div className="empty-section">
                      <p>No running tours at the moment.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'upcoming' && (
                <div className="trip-section">
                  {categorizedTrips.upcoming.length > 0 ? (
                    categorizedTrips.upcoming.map(trip => renderTripCard(trip))
                  ) : (
                    <div className="empty-section">
                      <p>No upcoming tours planned.</p>
                      <button onClick={() => navigate('/travel-planner')} className="btn-primary">
                        Plan Your Next Trip
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'completed' && (
                <div className="trip-section">
                  {categorizedTrips.completed.length > 0 ? (
                    categorizedTrips.completed.map(trip => renderTripCard(trip))
                  ) : (
                    <div className="empty-section">
                      <p>No completed tours found.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't accepted any trips yet.</p>
            <button onClick={() => navigate('/travel-planner')} className="btn-primary">
              Plan Your First Trip
            </button>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      <TripDetailsModal 
        trip={selectedTrip} 
        isOpen={isModalOpen}
        onClose={handleCloseModal} 
      />

      {/* Group Trip Request Modal */}
      <GroupTripRequestModal
        isOpen={showGroupTripModal}
        onClose={() => setShowGroupTripModal(false)}
        tripPlan={selectedTripForGroup?.tripPlan}
        onSubmit={handleCreateGroupTrip}
      />
    </div>
  );
};

export default MyTrips;