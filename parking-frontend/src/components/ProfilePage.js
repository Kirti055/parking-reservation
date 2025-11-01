import React, { useState, useEffect } from "react";
import { getSlots } from "../api/parkingApi";
import { getUserReservationHistory } from "../api/authApi";

const ProfilePage = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [stats, setStats] = useState({
    activeBookings: 0,
    totalReservations: 0
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const slots = await getSlots();
      const activeBooking = slots.filter(slot => 
        slot.action === 'occupied' && slot.rfid === user?.email
      );
      
      // Try to get history from API, fallback to localStorage
      try {
        const history = await getUserReservationHistory();
        setStats({
          activeBookings: activeBooking.length,
          totalReservations: history.totalReservations || 0
        });
      } catch (error) {
        // Fallback to localStorage count
        const reservationCount = parseInt(localStorage.getItem(`reservations_${user?.email}`) || '0');
        setStats({
          activeBookings: activeBooking.length,
          totalReservations: reservationCount
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    const updatedUser = { ...user, ...profileData };
    localStorage.setItem('parkingUser', JSON.stringify(updatedUser));
  };

  return (
    <div className="profile-page">
      <h1>My Profile</h1>
      
      <div className={`profile-container ${user?.role === 'admin' ? 'admin-profile' : ''}`}>
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          
          <div className="profile-info">
            <div className="info-row">
              <label>Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                />
              ) : (
                <span>{user?.name}</span>
              )}
            </div>
            
            <div className="info-row">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleChange}
                  disabled
                />
              ) : (
                <span>{user?.email}</span>
              )}
            </div>
            
            <div className="info-row">
              <label>Role:</label>
              <span className={`role-badge ${user?.role}`}>
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
            
            <div className="info-row">
              <label>Member Since:</label>
              <span>{new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="info-row">
              <label>Status:</label>
              <span className={`status-badge ${user?.isActive ? 'active' : 'inactive'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            {isEditing ? (
              <>
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        {user?.role !== 'admin' && (
          <div className="profile-stats">
            <h2>Account Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.totalReservations}</div>
                <div className="stat-label">Total Reservations</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.activeBookings}</div>
                <div className="stat-label">Active Bookings</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {Math.floor((new Date() - new Date(user?.createdAt)) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="stat-label">Days Active</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;