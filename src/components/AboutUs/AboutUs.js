import React from "react";
import "./AboutUs.css";

const AboutUs = () => (
  <div className="about-container">
    <div className="about-inner">
      {/* Hero section */}
      <div className="hero-section">
        <h1 className="hero-title">About CoinXTrade</h1>
        <p className="hero-description">
          CoinXTrade is a modern crypto portfolio tracker and market dashboard.
          Our mission is to empower everyone to understand, track, and grow
          their crypto investments with beautiful, real-time tools.
        </p>
      </div>
      {/* Features and mission */}
      <div className="features-mission">
        <div className="section-column">
          <h2 className="section-title">Features</h2>
          <ul className="feature-list">
            <li>
              Track your crypto portfolio with real-time prices and profit/loss
            </li>
            <li>See market overviews, news, and analytics</li>
            <li>Modern, animated UI for a fun and professional experience</li>
            <li>Secure authentication and privacy-first design</li>
          </ul>
        </div>
        <div className="section-column">
          <h2 className="section-title">Our Mission</h2>
          <p className="mission-text">
            Make crypto investing accessible, transparent, and enjoyable for
            everyone. We believe in empowering users with the best tools and
            data to make informed decisions.
          </p>
        </div>
      </div>
      {/* Contact */}
      <div className="contact-section">
        <h3 className="contact-title">Contact</h3>
        <p className="contact-text">
          Email:{" "}
          <a href="mailto:info@coinxtrade.com" className="contact-link">
            info@coinxtrade.com
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default AboutUs;
