import React, { useState, useEffect } from "react";
import SlotList from "./components/slotList";
import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import ContactPage from "./components/ContactPage";
import AboutPage from "./components/AboutPage";
import ProfilePage from "./components/ProfilePage";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const savedUser = localStorage.getItem('parkingUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('parkingUser');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('parkingUser', JSON.stringify(userData));
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('parkingUser');
    setCurrentPage('home');
  };

  const renderPage = () => {
    if (currentPage === 'contact') {
      return <ContactPage />;
    }
    if (currentPage === 'about') {
      return <AboutPage />;
    }
    if (currentPage === 'profile') {
      return <ProfilePage user={user} />;
    }
    
    // Home page
    if (user?.role === 'admin') {
      return <AdminDashboard />;
    } else {
      return (
        <>
          <h1>Parking Slot Reservation</h1>
          <div className="user-info-card">
            <p>You can book one parking slot at a time.</p>
            <p>To book a different slot, please free your current slot first.</p>
          </div>
          <SlotList />
        </>
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <nav className="navbar">
        <h1 onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer' }}>
          🚗 Parking System
        </h1>
        <div className="nav-links">
          <span className="welcome-text">Welcome, {user.name}!</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>
            {user.role === 'admin' ? 'Dashboard' : 'Home'}
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}>
            About
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); }}>
            Contact
          </a>
          <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('profile'); }}>
            Profile
          </a>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>

      <footer className="footer">
        <p>© 2025 Parking System | <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('contact'); }}>Contact Us</a></p>
      </footer>
    </div>
  );
}

export default App;