import React, { useState } from "react";
import BackButton from "../components/BackButton";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from "react-icons/fa";
import "../styles/Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We\'ll get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="contact-page">
      <BackButton to="/" label="Back to Home" className="contact-back-btn" />
      
      <div className="contact-container">
        <div className="contact-hero">
          <h1 className="contact-title">Get in Touch</h1>
          <p className="contact-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <div className="contact-content">
          <div className="contact-grid">
            {/* Contact Form */}
            <div className="contact-form-section">
              <div className="form-header">
                <h2>Send us a Message</h2>
                <p>Have a question, suggestion, or just want to say hello? We're here to help!</p>
              </div>
              
              {submitMessage && (
                <div className="success-message">
                  {submitMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="What's this about?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="contact-info-section">
              <div className="contact-info-card">
                <h3>Contact Information</h3>
                <p>Get in touch with us through any of these channels. We're available to help you plan your next adventure!</p>
                
                <div className="contact-details">
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <div>
                      <h4>Email</h4>
                      <p>support@wanderwise.com</p>
                      <p>partnerships@wanderwise.com</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <div>
                      <h4>Phone</h4>
                      <p>+1 (555) 123-4567</p>
                      <p>Monday - Friday, 9 AM - 6 PM EST</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaMapMarkerAlt className="contact-icon" />
                    <div>
                      <h4>Office</h4>
                      <p>123 Travel Street</p>
                      <p>Adventure City, AC 12345</p>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaClock className="contact-icon" />
                    <div>
                      <h4>Response Time</h4>
                      <p>Within 24 hours</p>
                      <p>Emergency support available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="social-media-card">
                <h3>Follow Us</h3>
                <p>Stay connected and get the latest travel tips, destination guides, and community updates.</p>
                <div className="social-links">
                  <a href="#" className="social-link facebook">
                    <FaFacebook />
                    <span>Facebook</span>
                  </a>
                  <a href="#" className="social-link twitter">
                    <FaTwitter />
                    <span>Twitter</span>
                  </a>
                  <a href="#" className="social-link instagram">
                    <FaInstagram />
                    <span>Instagram</span>
                  </a>
                  <a href="#" className="social-link linkedin">
                    <FaLinkedin />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>

              <div className="faq-card">
                <h3>Quick Questions?</h3>
                <div className="faq-list">
                  <div className="faq-item">
                    <strong>How do I reset my password?</strong>
                    <p>Go to the login page and click "Forgot Password"</p>
                  </div>
                  <div className="faq-item">
                    <strong>Can I change my trip after booking?</strong>
                    <p>Yes, modifications are possible up to 48 hours before departure</p>
                  </div>
                  <div className="faq-item">
                    <strong>Is my payment information secure?</strong>
                    <p>Absolutely! We use bank-level encryption for all transactions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
