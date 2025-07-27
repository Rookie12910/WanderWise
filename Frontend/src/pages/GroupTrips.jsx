import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupTripManager from '../components/GroupTripManager';
import GroupTripBrowser from '../components/GroupTripBrowser';
import '../styles/GroupTrips.css';

const GroupTrips = () => {
    const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'manage'
    const navigate = useNavigate(); 

    // Pricing calculation helper
    const calculateGroupPricing = (basePrice, currentMembers, maxMembers) => {
        const pricingTiers = [];
        const sharedCosts = basePrice * 0.3; // 30% of costs can be shared (accommodation, transport)
        const individualCosts = basePrice * 0.7; // 70% individual costs (food, activities)
        
        for (let members = currentMembers; members <= Math.min(maxMembers, currentMembers + 3); members++) {
            const costPerPerson = individualCosts + (sharedCosts / members);
            const savings = basePrice - costPerPerson;
            pricingTiers.push({
                members,
                cost: Math.round(costPerPerson),
                savings: Math.round(savings),
                isCurrent: members === currentMembers
            });
        }
        return pricingTiers;
    };

    return (
        <div className="group-trips-page">
            <div className="group-trips-header">
                <h1>Group Trips</h1>
                <p>Connect with fellow travelers and explore the world together</p>
                
                {/* Pricing Benefits Banner */}
                <div className="pricing-benefits-banner">
                    <div className="benefit-item">
                        <span className="benefit-icon">💰</span>
                        <span>Save up to 40% with group discounts</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">👥</span>
                        <span>More members = Lower costs per person</span>
                    </div>
                    <div className="benefit-item">
                        <span className="benefit-icon">🏨</span>
                        <span>Split accommodation & transport costs</span>
                    </div>
                </div>

                <button 
                    className="back-to-home-btn"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>

            <div className="group-trips-nav">
                <button 
                    className={`nav-tab ${activeTab === 'browse' ? 'active' : ''}`}
                    onClick={() => setActiveTab('browse')}
                >
                    <span className="tab-icon">🔍</span>
                    Browse Trips
                </button>
                <button 
                    className={`nav-tab ${activeTab === 'manage' ? 'active' : ''}`}
                    onClick={() => setActiveTab('manage')}
                >
                    <span className="tab-icon">⚙️</span>
                    My Trips
                </button>
            </div>

            <div className="group-trips-content">
                {activeTab === 'browse' && <GroupTripBrowser calculateGroupPricing={calculateGroupPricing} />}
                {activeTab === 'manage' && <GroupTripManager calculateGroupPricing={calculateGroupPricing} />}
            </div>
        </div>
    );
};

export default GroupTrips;
