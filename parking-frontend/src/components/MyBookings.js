import React, { useState, useEffect } from "react";
import { getUserBookings } from "../api/parkingApi";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await getUserBookings();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  return (
    <div className="my-bookings">
      <h2>My Scheduled Bookings</h2>
      {bookings.length === 0 ? (
        <p className="no-bookings">No scheduled bookings</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking.bookingId} className="booking-card">
              <h3>{booking.slotId}</h3>
              <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p><strong>Duration:</strong> {booking.duration} hour(s)</p>
              <span className={`booking-status ${booking.status}`}>
                {booking.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;