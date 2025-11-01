import React, { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSlots } from "../api/parkingApi";
import { getAllUsers } from "../api/authApi";

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    slotUsage: [],
    hourlyUsage: [],
    userGrowth: [],
    occupancyRate: 0
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const slots = await getSlots();
      const users = await getAllUsers();

      // Real slot usage data
      const occupied = slots.filter(s => s.action === 'occupied').length;
      const free = slots.filter(s => s.action === 'free').length;
      const slotUsageData = [
        { name: 'Occupied', value: occupied, color: '#ef4444' },
        { name: 'Available', value: free, color: '#10b981' }
      ];

      const occupancyRate = slots.length > 0 ? ((occupied / slots.length) * 100).toFixed(1) : 0;

      // Real hourly usage from slot timestamps
      const hourlyData = generateHourlyData(slots);

      // Real user growth data
      const userGrowthData = generateUserGrowthData(users);

      // Real slot performance from localStorage booking counts
      const slotBookingData = slots.map(slot => {
        const bookingCount = parseInt(localStorage.getItem(`slot_bookings_${slot.slotId}`) || '0');
        return {
          slotId: slot.slotId,
          status: slot.action,
          bookings: bookingCount
        };
      });

      setAnalyticsData({
        slotUsage: slotUsageData,
        hourlyUsage: hourlyData,
        userGrowth: userGrowthData,
        occupancyRate: occupancyRate,
        slotBookings: slotBookingData
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHourlyData = (slots) => {
  const hourlyBookings = {};
  const now = new Date();
  
  // Initialize last 24 hours with every 3rd hour to reduce crowding
  for (let i = 23; i >= 0; i--) {
    const hour = new Date(now - i * 60 * 60 * 1000);
    const hourKey = String(hour.getHours()).padStart(2, '0');
    hourlyBookings[hourKey] = 0;
  }

  // Count bookings per hour from occupied slots
  slots.filter(s => s.action === 'occupied').forEach(slot => {
    try {
      const slotTime = new Date(slot.timestamp);
      const hoursDiff = Math.floor((now - slotTime) / (1000 * 60 * 60));
      
      if (hoursDiff >= 0 && hoursDiff < 24) {
        const hourKey = String(slotTime.getHours()).padStart(2, '0');
        if (hourlyBookings[hourKey] !== undefined) {
          hourlyBookings[hourKey]++;
        }
      }
    } catch (e) {
      console.error('Error parsing slot timestamp:', e);
    }
  });

  // Convert to array and format for display
  return Object.keys(hourlyBookings).sort((a, b) => Number(a) - Number(b)).map(hour => ({
    hour: `${hour}:00`,
    bookings: hourlyBookings[hour]
  }));
};

  const generateUserGrowthData = (users) => {
    const monthlyData = {};
    
    users.forEach(user => {
      try {
        const date = new Date(user.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
      } catch (e) {
        console.error('Error parsing user date:', e);
      }
    });

    return Object.keys(monthlyData).sort().map(month => ({
      month: month,
      users: monthlyData[month]
    }));
  };

  const downloadReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      totalSlots: analyticsData.slotUsage.reduce((a, b) => a + b.value, 0),
      occupiedSlots: analyticsData.slotUsage[0]?.value || 0,
      availableSlots: analyticsData.slotUsage[1]?.value || 0,
      occupancyRate: analyticsData.occupancyRate,
      totalUsers: analyticsData.userGrowth.reduce((a, b) => a + b.users, 0),
      hourlyBookings: analyticsData.hourlyUsage,
      userGrowth: analyticsData.userGrowth,
      slotPerformance: analyticsData.slotBookings
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `parking-report-${Date.now()}.json`;
    link.click();
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics & Reports</h2>
        <button className="download-report-btn" onClick={downloadReport}>
          Download Report
        </button>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card highlight-card">
          <h3>Current Occupancy Rate</h3>
          <div className="occupancy-meter">
            <div className="occupancy-value">{analyticsData.occupancyRate}%</div>
            <div className="occupancy-bar">
              <div 
                className="occupancy-fill" 
                style={{ width: `${analyticsData.occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="analytics-card">
          <h3>Slot Usage Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analyticsData.slotUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analyticsData.slotUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card full-width">
            <h3>Hourly Booking Activity (Last 24 Hours)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData.hourlyUsage} margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="hour" 
                    interval="preserveStartEnd"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Active Bookings"
                />
                </LineChart>
            </ResponsiveContainer>
            </div>

        <div className="analytics-card full-width">
          <h3>User Growth Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" fill="#10b981" name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card full-width">
          <h3>Slot Performance</h3>
          <div className="performance-table">
            <table>
              <thead>
                <tr>
                  <th>Slot ID</th>
                  <th>Current Status</th>
                  <th>Total Bookings</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.slotBookings?.map(slot => {
                  const maxBookings = Math.max(...analyticsData.slotBookings.map(s => s.bookings), 1);
                  return (
                    <tr key={slot.slotId}>
                      <td>{slot.slotId}</td>
                      <td>
                        <span className={`status-badge ${slot.status}`}>
                          {slot.status}
                        </span>
                      </td>
                      <td>{slot.bookings}</td>
                      <td>
                        <div className="performance-bar">
                          <div 
                            className="performance-fill"
                            style={{ width: `${(slot.bookings / maxBookings) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;