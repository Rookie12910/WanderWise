import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/BackButton.css';

const BackButton = ({ to, label = 'Back', className = '' }) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1); // Default behavior: go back in history
    }
  };
  
  return (
    <button 
      className={`back-button ${className}`}
      onClick={handleBack}
      aria-label={label}
    >
      <FaArrowLeft className="back-icon" />
      <span className="back-text">{label}</span>
    </button>
  );
};

export default BackButton;
