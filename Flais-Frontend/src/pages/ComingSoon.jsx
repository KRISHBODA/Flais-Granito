import React from 'react';
import logoWhite from '../assets/Flais White.png';
import './ComingSoon.css';

const ComingSoon = () => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-backdrop" />
      <div className="coming-soon-content">
        <img 
          src={logoWhite} 
          alt="FLAIS GRANITO" 
          className="coming-soon-logo"
        />
        <div className="coming-soon-divider" />
        <h1 className="coming-soon-title">Coming Soon</h1>
        <p className="coming-soon-subtitle">
          Our website is currently under preparation.
        </p>
        <p className="coming-soon-text">
          Please check back soon.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
