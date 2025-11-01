import React from "react";

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Parking System</h1>
        <p>Smart parking management made simple</p>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We're dedicated to revolutionizing parking management through innovative technology. 
            Our system helps users find and reserve parking spots quickly and efficiently, while 
            providing administrators with powerful tools to manage parking facilities.
          </p>
        </section>

        <section className="about-section">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Find Parking</h3>
              <p>Browse available parking slots in real-time and find the perfect spot.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Reserve Online</h3>
              <p>Book your parking spot instantly with just a few clicks.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎫</div>
              <h3>RFID Access</h3>
              <p>Quick and secure entry/exit using RFID technology.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track & Manage</h3>
              <p>Real-time monitoring and analytics for parking facility management.</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Key Features</h2>
          <ul className="features-list">
            <li>Real-time parking availability updates</li>
            <li>Secure user authentication and authorization</li>
            <li>RFID-based access control</li>
            <li>Admin dashboard with analytics</li>
            <li>User management system</li>
            <li>Responsive design for all devices</li>
            <li>Cloud-based infrastructure for reliability</li>
          </ul>
        </section>

        <section className="about-section">
          <h2>Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-item">
              <strong>Frontend:</strong> React.js
            </div>
            <div className="tech-item">
              <strong>Backend:</strong> AWS Lambda (Python)
            </div>
            <div className="tech-item">
              <strong>Database:</strong> Amazon DynamoDB
            </div>
            <div className="tech-item">
              <strong>API:</strong> Amazon API Gateway
            </div>
            <div className="tech-item">
              <strong>Authentication:</strong> JWT Tokens
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;