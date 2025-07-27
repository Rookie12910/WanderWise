import React from "react";
import BackButton from "../components/BackButton";
import { FaUsers, FaGlobe, FaHeart, FaMapPin, FaStar, FaShieldAlt } from "react-icons/fa";
import "../styles/About.css";

const About = () => {
  return (
    <div className="about-page">
      <BackButton to="/" label="Back to Home" className="about-back-btn" />
      
      <div className="about-container">
        <div className="about-hero">
          <h1 className="about-title">About WanderWise</h1>
          <p className="about-subtitle">Your intelligent travel companion for unforgettable journeys</p>
        </div>

        <div className="about-content">
          <div className="about-section">
            <div className="section-header">
              <FaGlobe className="section-icon" />
              <h2>Our Mission</h2>
            </div>
            <p>
              At WanderWise, we believe that every journey should be an adventure filled with discovery, 
              connection, and wonder. We're dedicated to making your travel planning seamless, intelligent, 
              and enjoyable by combining cutting-edge technology with personalized experiences.
            </p>
          </div>

          <div className="about-section">
            <div className="section-header">
              <FaHeart className="section-icon" />
              <h2>What Makes Us Special</h2>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <FaMapPin className="feature-icon" />
                <h3>Smart Trip Planning</h3>
                <p>AI-powered recommendations tailored to your preferences, budget, and travel style.</p>
              </div>
              <div className="feature-card">
                <FaUsers className="feature-icon" />
                <h3>Community Connection</h3>
                <p>Connect with fellow travelers, share experiences, and discover hidden gems through our vibrant community.</p>
              </div>
              <div className="feature-card">
                <FaStar className="feature-icon" />
                <h3>Personalized Experience</h3>
                <p>Every recommendation is crafted based on your unique interests and past travel experiences.</p>
              </div>
              <div className="feature-card">
                <FaShieldAlt className="feature-icon" />
                <h3>Safe & Secure</h3>
                <p>Your privacy and security are our top priorities with enterprise-grade data protection.</p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <div className="section-header">
              <FaUsers className="section-icon" />
              <h2>Our Story</h2>
            </div>
            <p>
              Founded in 2024 by a team of passionate travelers and technology enthusiasts, WanderWise was born 
              from the frustration of spending countless hours planning trips only to miss out on the best experiences. 
              We realized that travel planning should be as exciting as the journey itself.
            </p>
            <p>
              Today, WanderWise serves thousands of travelers worldwide, helping them discover amazing destinations, 
              connect with like-minded adventurers, and create memories that last a lifetime. From solo backpackers 
              to family vacations, from weekend getaways to month-long expeditions – we're here to make every trip 
              extraordinary.
            </p>
          </div>

          <div className="about-section">
            <h2>Our Values</h2>
            <div className="values-list">
              <div className="value-item">
                <strong>Innovation:</strong> We continuously evolve our platform with the latest technology to enhance your travel experience.
              </div>
              <div className="value-item">
                <strong>Community:</strong> We believe that the best travel experiences come from sharing and connecting with others.
              </div>
              <div className="value-item">
                <strong>Authenticity:</strong> We promote genuine, local experiences that respect cultures and communities.
              </div>
              <div className="value-item">
                <strong>Sustainability:</strong> We encourage responsible travel that preserves our beautiful planet for future generations.
              </div>
            </div>
          </div>

          <div className="about-cta">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join thousands of travelers who trust WanderWise to make their adventures unforgettable.</p>
            <button 
              className="btn-primary cta-button"
              onClick={() => window.location.href = '/'}
            >
              Start Planning Your Trip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
