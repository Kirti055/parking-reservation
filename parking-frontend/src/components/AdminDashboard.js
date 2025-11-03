// src/components/AdminDashboard.js
import React, { useState, useEffect } from "react";
import AdminSlotManagement from "./AdminSlotManagement";
import AdminLotManagement from "./AdminLotManagement"; // NEW
import AdminAnalytics from "./AdminAnalytics";
import { getAllUsers, getSystemStats } from "../api/authApi";
import { getSlots, getAllParkingLots } from "../api/parkingApi"; // UPDATED

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [slots, setSlots] = useState([]);
  const [parkingLots, setParkingLots] = useState([]); // NEW
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchSlots();
    fetchParkingLots(); // NEW
  }, []);

  const fetchUsers = async () => {
    try {
      const userData = await getAllUsers();
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getSystemStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      //setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const slotsData = await getSlots(); // Get all slots
      setSlots(slotsData);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  // NEW
  const fetchParkingLots = async () => {
    try {
      const lotsData = await getAllParkingLots();
      setParkingLots(lotsData);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers || users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Parking Lots</h3>
          <p className="stat-number">{parkingLots.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Slots</h3>
          <p className="stat-number">{stats.totalSlots || slots.length}</p>
        </div>
        <div className="stat-card">
          <h3>Occupied Slots</h3>
          <p className="stat-number">{stats.occupiedSlots || slots.filter(s => s.action === 'occupied').length}</p>
        </div>
        <div className="stat-card">
          <h3>Available Slots</h3>
          <p className="stat-number">{stats.availableSlots || slots.filter(s => s.action === 'free').length}</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'lots' ? 'active' : ''}`}
          onClick={() => setActiveTab('lots')}
        >
          Parking Lots
        </button>
        <button
          className={`tab-btn ${activeTab === 'manage' ? 'active' : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          Manage Slots
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics & Reports
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div>
            <h2>Parking Overview</h2>
            <div className="overview-grid">
              <div className="overview-card">
                <h3>Parking Lots Summary</h3>
                {parkingLots.length === 0 ? (
                  <p>No parking lots yet. Go to "Parking Lots" tab to add one.</p>
                ) : (
                  <table className="simple-table">
                    <thead>
                      <tr>
                        <th>Parking Lot</th>
                        <th>Capacity</th>
                        <th>Slots</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parkingLots.map(lot => {
                        const lotSlots = slots.filter(s => s.lotId === lot.lotId);
                        const occupied = lotSlots.filter(s => s.action === 'occupied').length;
                        return (
                          <tr key={lot.lotId}>
                            <td>{lot.name}</td>
                            <td>{lot.capacity}</td>
                            <td>
                              {occupied}/{lotSlots.length} occupied
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="overview-card">
                <h3>Current Slot Status</h3>
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Slot ID</th>
                      <th>Status</th>
                      <th>User Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map(slot => (
                      <tr key={slot.slotId}>
                        <td>{slot.slotId}</td>
                        <td>
                          <span className={`status-badge ${slot.action}`}>
                            {slot.action}
                          </span>
                        </td>
                        <td>{slot.rfid || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'lots' && (
          <AdminLotManagement />
        )}
        
        {activeTab === 'manage' && (
          <div>
            <AdminSlotManagement />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <AdminAnalytics />
        )}
        
        {activeTab === 'users' && (
          <div>
            <h2>User Management</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;