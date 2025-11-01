import React, { useState } from "react";
import { scheduleFutureBooking } from "../api/parkingApi";

const BookingCalendar = ({ slot, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState('2');
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const bookingDetails = {
        slotId: slot.slotId,
        userEmail: user.email,
        userName: user.name,
        date: selectedDate,
        time: selectedTime,
        duration: parseInt(duration)
      };

      await scheduleFutureBooking(bookingDetails);
      alert(`Booking scheduled successfully for ${selectedDate} at ${selectedTime}`);
      onSuccess();
    } catch (error) {
      alert('Booking failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30); // 30 days advance booking
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-calendar-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule Booking - {slot.slotId}</h2>
        
        <div className="booking-form">
          <div className="form-group">
            <label>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              required
            />
            <small>Book up to 30 days in advance</small>
          </div>

          <div className="form-group">
            <label>Select Time</label>
            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Choose time...</option>
              {Array.from({ length: 24 }, (_, i) => {
                const hour = String(i).padStart(2, '0');
                return (
                  <option key={hour} value={`${hour}:00`}>
                    {hour}:00 - {String((i + 1) % 24).padStart(2, '0')}:00
                  </option>
                );
              })}
            </select>
          </div>

          <div className="form-group">
            <label>Duration (hours)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="3">3 hours</option>
              <option value="4">4 hours</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
            </select>
          </div>

          <div className="booking-summary">
            <h4>Booking Summary</h4>
            <p><strong>Slot:</strong> {slot.slotId}</p>
            <p><strong>Date:</strong> {selectedDate || 'Not selected'}</p>
            <p><strong>Time:</strong> {selectedTime || 'Not selected'}</p>
            <p><strong>Duration:</strong> {duration} hour(s)</p>
          </div>

          <div className="modal-actions">
            <button
              className="submit-btn"
              onClick={handleBooking}
              disabled={loading || !selectedDate || !selectedTime}
            >
              {loading ? 'Scheduling...' : 'Confirm Booking'}
            </button>
            <button className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;