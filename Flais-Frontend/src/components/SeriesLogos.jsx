import React from 'react';

export const LiscLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="70" textAnchor="middle" style={{ font: 'bold 80px "Montserrat", sans-serif', fill: 'currentColor' }}>LISC</text>
    <text x="50%" y="120" textAnchor="middle" style={{ font: '40px "Montserrat", sans-serif', fill: 'currentColor' }}>collection</text>
  </svg>
);

export const GlassLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="80" textAnchor="middle" style={{ font: 'normal 90px "Montserrat", sans-serif', fill: 'currentColor' }}>Glass</text>
    <text x="50%" y="125" textAnchor="middle" style={{ font: 'bold 20px "Montserrat", sans-serif', letterSpacing: '10px', fill: 'currentColor' }}>COLLECTION</text>
  </svg>
);

export const MarvelLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <text x="50%" y="80" textAnchor="middle" style={{ font: '900 80px "Montserrat", sans-serif', letterSpacing: '-2px', fill: 'currentColor' }}>MARVEL</text>
    <text x="50%" y="120" textAnchor="middle" style={{ font: 'bold 18px "Montserrat", sans-serif', letterSpacing: '12px', fill: 'currentColor' }}>COLLECTION</text>
  </svg>
);

export const MarbleGlossLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 180" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M185 30 L190 45 L205 50 L190 55 L185 70 L180 55 L165 50 L180 45 Z" fill="#D2C9B1" />
    <path d="M210 50 L213 58 L221 61 L213 64 L210 72 L207 64 L199 61 L207 58 Z" fill="#D2C9B1" />
    <text x="50%" y="100" textAnchor="middle" style={{ font: 'italic 70px "Montserrat", sans-serif', fill: 'currentColor' }}>Marble</text>
    <text x="50%" y="150" textAnchor="middle" style={{ font: '900 60px "Montserrat", sans-serif', fill: 'currentColor' }}>GLOSS</text>
  </svg>
);

export const ExtraMaxLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 220" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Simple Crown Icon */}
    <path d="M160 60 L170 40 L185 60 L200 30 L215 60 L230 40 L240 60 L240 80 L160 80 Z" fill="#FFD700" />
    <circle cx="200" cy="25" r="5" fill="#FFD700" />
    <text x="50%" y="140" textAnchor="middle" style={{ font: '900 70px "Montserrat", sans-serif', fill: 'currentColor', letterSpacing: '-3px' }}>extra max</text>
    <text x="50%" y="185" textAnchor="middle" style={{ font: 'normal 35px "Montserrat", sans-serif', fill: 'currentColor' }}>Collection</text>
  </svg>
);

export const ElectraLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(200, 75)" style={{ font: 'bold 70px "Montserrat", sans-serif', fill: 'currentColor' }}>
      <text x="-160" y="0">E</text>
      <text x="-110" y="0" transform="scale(-1, 1) translate(-220, 0)">L</text>
      <text x="-60" y="0" transform="scale(-1, 1) translate(-120, 0)">E</text>
      <text x="-10" y="0">C</text>
      <text x="40" y="0">T</text>
      <text x="90" y="0" transform="scale(-1, 1) translate(180, 0)">R</text>
      <text x="140" y="0">A</text>
    </g>
    <text x="50%" y="125" textAnchor="middle" style={{ font: 'bold 18px "Montserrat", sans-serif', letterSpacing: '8px', fill: 'currentColor' }}>COLLECTION</text>
  </svg>
);

export const DecorLogo = ({ className = "" }) => (
  <svg viewBox="0 0 400 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(45, 80)" style={{ font: 'bold 85px "Montserrat", sans-serif', fill: 'currentColor' }}>
      <text x="0" y="0">D</text>
      <text x="75" y="0">E</text>
      <text x="135" y="0">C</text>
      <text x="200" y="0">O</text>
      <text x="265" y="0">R</text>
      {/* Decorative diagonal cuts */}
      <rect x="5" y="-55" width="2" height="60" transform="rotate(45, 5, -25)" fill="white" />
      <rect x="80" y="-55" width="2" height="60" transform="rotate(45, 80, -25)" fill="white" />
      <rect x="140" y="-55" width="2" height="60" transform="rotate(45, 140, -25)" fill="white" />
      <rect x="205" y="-55" width="2" height="60" transform="rotate(45, 205, -25)" fill="white" />
      <rect x="270" y="-55" width="2" height="60" transform="rotate(45, 270, -25)" fill="white" />
    </g>
    <text x="50%" y="130" textAnchor="middle" style={{ font: 'normal 40px "Montserrat", sans-serif', fill: 'currentColor' }}>collection</text>
  </svg>
);
export const SoronaSymbol = ({ className = "w-6 h-6", color = "currentColor" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 75L50 25L80 75" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
