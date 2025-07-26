import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaBell, FaTimes, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import notificationService from '../services/notificationService';
import api, { tripApi } from '../api';
import './NotificationCenter.css';
import { useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom';

const NotificationCenter = () => {
    // Dialog state for cancel trip
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTripId, setDialogTripId] = useState(null);
    const [dialogNotificationId, setDialogNotificationId] = useState(null);

    // Cancel trip logic
    const handleCancelTrip = async () => {
        if (!dialogTripId) return;
        try {
            await tripApi.deleteTripPlan(dialogTripId);
            setNotifications(prev => prev.filter(n => n.id !== dialogNotificationId));
            setDialogOpen(false);
            setDialogTripId(null);
            setDialogNotificationId(null);
            navigate('/create-trip');
        } catch (error) {
            alert('Failed to cancel trip.');
        }
    };

    // Confirmation dialog JSX
    const renderDialog = () => (
        dialogOpen && ReactDOM.createPortal(
            <div className="modal-overlay">
                <div className="modal-card">
                    <div className="modal-title">
                        <span className="modal-icon">⚠️</span> Cancel Trip
                    </div>
                    <div className="modal-message">
                        Are you sure you want to cancel this trip?<br />This action cannot be undone.
                    </div>
                    <div className="modal-actions">
                        <button className="modal-btn modal-cancel" onClick={() => { setDialogOpen(false); }}>No</button>
                        <button className="modal-btn modal-confirm" onClick={handleCancelTrip}>Yes, Cancel</button>
                    </div>
                </div>
            </div>,
            document.body
        )
    );
    const { currentUser } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [upcomingTripIds, setUpcomingTripIds] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const effectiveUser = currentUser || (localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : null);

    // Weather suggestion modal state
    const [suggestionModal, setSuggestionModal] = useState({ open: false, message: '' });

    // Weather suggestion modal JSX
    const renderSuggestionModal = () => {
        if (!suggestionModal.open) return null;
        // Split into sections by double newlines or section keywords
        let sections = suggestionModal.message.split(/\n\s*\n|(?=Packing recommendations:|Safety tips:|Local advice:|Closing advice:)/i).filter(Boolean);
        // Remove all 'Final Advice' and 'Closing' sections
        let localAdviceContent = [];
        let filteredSections = [];
        for (let i = 0; i < sections.length; i++) {
            let section = sections[i];
            // Remove stray asterisks and normalize whitespace
            section = section.replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
            if (/final advice|closing|encouraging note/i.test(section)) continue; // skip all Final Advice/Closing/Encouraging Note
            if (/^local advice[:\s-]*/i.test(section)) {
                // Remove heading and collect content
                localAdviceContent.push(section.replace(/^local advice[:\s-]*/i, ''));
                continue;
            }
            filteredSections.push(section);
        }
        // Merge all Local Advice into one section if any found
        if (localAdviceContent.length > 0) {
            filteredSections.push('Local Advice: ' + localAdviceContent.join(' '));
        }
        sections = filteredSections;
        // Helper to strip markdown and render bullet points
        const stripMarkdown = (str) => str.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/`([^`]+)`/g, '$1');
        const renderBullets = (text, sectionTitle = '') => {
            let cleanText = stripMarkdown(text).replace(/\*+/g, '').replace(/\s+/g, ' ').trim();
            // Remove all repeated section titles (case-insensitive, anywhere in the text)
            if (sectionTitle) {
                const regex = new RegExp(sectionTitle.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '[:\s-]*', 'gi');
                cleanText = cleanText.replace(regex, '').trim();
            }
            // Standardize bullets: split on lines starting with a bullet, dash, or numbered list
            const lines = cleanText.split(/\n[•\-\d+\.\s]/).map((l, i) => i === 0 ? l : '• ' + l);
            if (lines.length > 1) {
                return <ul style={{ paddingLeft: 22, margin: 0 }}>{lines.map((line, idx) => <li key={idx}>{line.replace(/^• /, '').trim()}</li>)}</ul>;
            }
            return <span style={{ whiteSpace: 'pre-line' }}>{cleanText}</span>;
        };
        // Section titles
        const getSectionTitle = (section) => {
            if (/packing/i.test(section)) return 'Packing Recommendations';
            if (/safety/i.test(section)) return 'Safety Tips';
            if (/local/i.test(section)) return 'Local Advice';
            if (/final advice|enjoy|safe|trip|closing/i.test(section)) return '';
            return '';
        };
        return ReactDOM.createPortal(
            <div className="modal-overlay" style={{ zIndex: 100000 }}>
                <div className="modal-card" style={{ maxWidth: 650, minWidth: 340, border: '2px solid #00bcd4', boxShadow: '0 8px 32px rgba(0,188,212,0.18)', maxHeight: '90vh', overflow: 'hidden', padding: 0 }}>
                    <div className="modal-title" style={{ color: '#00796b', fontSize: '1.3rem', marginBottom: 0, display: 'flex', alignItems: 'center', padding: '18px 24px 0 24px' }}>
                        Weather Advice
                        <button onClick={() => setSuggestionModal({ open: false, message: '' })} style={{ background: 'none', border: 'none', fontSize: '1.3rem', color: '#888', marginLeft: 'auto', cursor: 'pointer' }} title="Close">×</button>
                    </div>
                    <div className="modal-message" style={{ color: '#333', background: '#e0f7fa', borderRadius: 8, padding: '20px 22px', margin: '18px 0 0 0', fontSize: '1.08rem', textAlign: 'left', minWidth: 220, maxHeight: '60vh', overflowY: 'auto' }}>
                        {sections.map((section, idx) => (
                            <div key={idx} style={{ marginBottom: 18 }}>
                                <div style={{ fontWeight: 600, color: '#0097a7', marginBottom: 4, fontSize: '1.08em' }}>
                                    {getSectionTitle(section)}
                                </div>
                                <div>{renderBullets(section, getSectionTitle(section))}</div>
                            </div>
                        ))}
                    </div>
                    <div className="modal-actions" style={{ padding: '14px 0 18px 0' }}>
                        <button className="modal-btn modal-confirm" style={{ background: '#00bcd4', color: 'white', border: 'none', fontWeight: 600, fontSize: '1.08em', padding: '10px 32px' }} onClick={() => setSuggestionModal({ open: false, message: '' })}>OK</button>
                    </div>
                </div>
            </div>,
            document.body
        );
    };

    useEffect(() => {
        if (effectiveUser) {
            // Load existing notifications
            loadNotifications();
            // Load upcoming trips
            if (tripApi.getTripPlansByStatus) {
                tripApi.getTripPlansByStatus('upcoming').then(data => {
                    let trips = Array.isArray(data) ? data : (data.trips || []);
                    setUpcomingTripIds(trips.map(trip => trip.id));
                }).catch(() => setUpcomingTripIds([]));
            }

            // Try to connect to WebSocket, but don't fail if it's not available
            try {
                notificationService.connect(effectiveUser.id, handleNewNotification);
            } catch (error) {
                console.warn('WebSocket connection failed, will work without real-time updates:', error);
            }

            return () => {
                try {
                    notificationService.disconnect();
                } catch (error) {
                    console.warn('Error disconnecting WebSocket:', error);
                }
            };
        }
    }, [effectiveUser]);

    const handleNewNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('WanderWise Alert', {
                body: notification.message,
                icon: '/favicon.ico'
            });
        }
    };

    const loadNotifications = async () => {
        if (!effectiveUser) return;
        
        try {
            setIsLoading(true);
            const response = await api.get('/api/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications:', error);
            // Add some mock data for testing if API fails
            const mockNotifications = [
                {
                    id: 1,
                    type: 'WEATHER_ALERT',
                    message: 'Adverse weather conditions detected for your upcoming trip to Sylhet. Weather alert detected for your trip to Sylhet. Please pack appropriate gear and monitor weather updates.',
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    tripId: 1
                },
                {
                    id: 2,
                    type: 'WEATHER_ALERT',
                    message: 'Adverse weather conditions detected for your upcoming trip to Sylhet. Weather alert detected for your trip to Sylhet. Please pack appropriate gear and monitor weather updates.',
                    isRead: false,
                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                    tripId: 1
                }
            ];
            setNotifications(mockNotifications);
            setUnreadCount(2);
        } finally {
            setIsLoading(false);
        }
            {/* Render the weather suggestion modal if open */}
            {renderSuggestionModal()}
    };

    const markAsRead = async (notificationId) => {
        console.log('Marking notification as read:', notificationId);
        try {
            await api.put(`/api/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            console.log('Successfully marked as read');
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // Still update the UI even if API fails
            setNotifications(prev => 
                prev.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
            console.log('Updated UI locally (API failed)');
        }
    };

    const deleteNotification = async (notificationId) => {
        console.log('Deleting notification:', notificationId);
        try {
            const notificationToDelete = notifications.find(n => n.id === notificationId);
            await api.delete(`/api/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            // Update unread count if the deleted notification was unread
            if (notificationToDelete && !notificationToDelete.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            console.log('Successfully deleted notification');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            // Still update the UI even if API fails
            const notificationToDelete = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            
            // Update unread count if the deleted notification was unread
            if (notificationToDelete && !notificationToDelete.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
            console.log('Updated UI locally (API failed)');
        }
    };

    const markAllAsRead = async () => {
        console.log('Marking all notifications as read');
        try {
            await api.post('/api/notifications/mark-all-read');
            setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
            console.log('Successfully marked all as read');
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            // Still update the UI even if API fails
            setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
            console.log('Updated UI locally (API failed)');
        }
    };

    const clearAllNotifications = async () => {
        console.log('Clearing all notifications');
        try {
            await api.delete(`/api/notifications/user/${effectiveUser.id}/all`);
            setNotifications([]);
            setUnreadCount(0);
            console.log('Successfully cleared all notifications');
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            // Still update the UI even if API fails
            setNotifications([]);
            setUnreadCount(0);
            console.log('Updated UI locally (API failed)');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'WEATHER_ALERT':
                return <FaExclamationTriangle className="notification-icon weather-alert" />;
            default:
                return <FaInfoCircle className="notification-icon info" />;
        }
    };

    const formatTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    // Request notification permission on component mount
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const handleNotificationClick = async (notification) => {
        if (notification.type === 'WEATHER_ALERT') {
            await markAsRead(notification.id);
            
            // Get tripId from notification
            const tripId = notification.tripId;
            if (tripId) {
                setIsOpen(false);
                navigate(`/weather-details/${tripId}`);
            } else {
                console.log('No tripId found in notification');
            }
        }
    };

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    if (!effectiveUser) return null;

    // Always render the weather suggestion modal at the top level
    // so it is not lost inside a function or unreachable code

    // Compute filtered notifications and filtered unread count
    const filteredNotifications = notifications.filter(n => {
        if (!n.tripId) return true;
        return upcomingTripIds.includes(n.tripId);
    });
    const filteredUnreadCount = filteredNotifications.filter(n => !n.isRead).length;

    // REMOVE this duplicate/broken return block
    return (
        <>
            {renderSuggestionModal()}
            <div className="notification-center">
                {/* Render the cancel trip confirmation dialog if open */}
                {renderDialog()}
                <button 
                    className="notification-bell"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(!isOpen);
                    }}
                >
                    <FaBell />
                    {filteredUnreadCount > 0 && (
                        <span className="notification-badge">{filteredUnreadCount}</span>
                    )}
                </button>
                {isOpen && ReactDOM.createPortal(
                    <div className="notification-dropdown" ref={dropdownRef}>
                        <div className="notification-header">
                            <h3>Notifications</h3>
                            <div className="notification-actions">
                                {notifications.length > 0 && unreadCount > 0 && (
                                    <button 
                                        className="mark-all-read-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllAsRead();
                                        }}
                                    >
                                        Mark all read
                                    </button>
                                )}
                                {notifications.length > 0 && (
                                    <button 
                                        className="clear-all-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearAllNotifications();
                                        }}
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="notification-list">
                            {isLoading ? (
                                <div className="notification-loading">Loading notifications...</div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="no-notifications">
                                    <div className="empty-icon">🔔</div>
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                filteredNotifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="notification-content">
                                            <div className="notification-main" onClick={() => handleNotificationClick(notification)}>
                                                {getNotificationIcon(notification.type)}
                                                <div className="notification-text">
                                                    <p className="notification-message">{notification.message}</p>
                                                    <span className="notification-time">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                    {/* Add Suggestion and Customization buttons for WEATHER_ALERT */}
                                                    {notification.type === 'WEATHER_ALERT' && (
                                                        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', background: '#ffecb3', padding: '6px', borderRadius: '6px', justifyContent: 'flex-start' }}>
                                                            <button
                                                                className="weather-suggestion-btn"
                                                                onClick={async e => {
                                                                    e.stopPropagation();
                                                                    try {
                                                                        const tripId = notification.tripId;
                                                                        if (!tripId) throw new Error('Trip ID not found');
                                                                        const res = await api.get(`/api/weather/suggestion/${tripId}`);
                                                                        const suggestion = res.data && res.data.suggestion ? res.data.suggestion : 'No suggestion available.';
                                                                        setSuggestionModal({ open: true, message: suggestion });
                                                                    } catch (err) {
                                                                        setSuggestionModal({ open: true, message: 'Failed to get suggestion.' });
                                                                    }
                                                                }}
                                                                title="Get Suggestions"
                                                                style={{ background: '#e0f7fa', border: '1px solid #00bcd4', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }}
                                                            >
                                                                Suggestion
                                                            </button>
                                                            <button
                                                                className="weather-cancel-btn"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    setDialogOpen(true);
                                                                    setDialogTripId(notification.tripId);
                                                                    setDialogNotificationId(notification.id);
                                                                }}
                                                                title="Cancel Trip"
                                                                style={{ background: '#ffcdd2', border: '1px solid #e57373', borderRadius: '4px', padding: '4px 12px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }}
                                                            >
                                                                Cancel Trip
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="notification-buttons">
                                                {!notification.isRead && (
                                                    <button 
                                                        className="mark-read-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification.id);
                                                        }}
                                                        title="Mark as read"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                <button 
                                                    className="delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    title="Delete notification"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>,
                    document.getElementById('notification-root')
                )}
            </div>
        </>
    );
}

export default NotificationCenter;