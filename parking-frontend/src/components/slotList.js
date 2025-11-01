import React, { useEffect, useState } from "react";
import { getSlots, reserveSlot, freeSlot } from "../api/parkingApi";
import { sendBookingEmail } from "../api/emailApi";
import BookingCalendar from "./BookingCalendar";

const SlotList = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');

  const fetchSlots = async () => {
    try {
      const data = await getSlots();
      setSlots(data);
      setError('');
      setLastUpdate(new Date());
    } catch (error) {
      setError('Failed to load slots');
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();

    // Real-time updates - poll every 5 seconds
    const interval = setInterval(() => {
      fetchSlots();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const incrementReservationCount = () => {
    const countKey = `reservations_${user.email}`;
    const currentCount = parseInt(localStorage.getItem(countKey) || '0');
    localStorage.setItem(countKey, (currentCount + 1).toString());
  };

  const handleQuickReserve = async (slotId) => {
    const userHasSlot = slots.some(slot => 
      slot.action === 'occupied' && slot.rfid === user.email
    );

    if (userHasSlot) {
      alert('You already have a slot booked. Please free your current slot before booking another one.');
      return;
    }

    const rfid = user.email;
    try {
      await reserveSlot(slotId, rfid);
      incrementReservationCount();
      
      const slotCountKey = `slot_bookings_${slotId}`;
      const currentCount = parseInt(localStorage.getItem(slotCountKey) || '0');
      localStorage.setItem(slotCountKey, (currentCount + 1).toString());
      
      const timestamp = new Date().toISOString();
      await sendBookingEmail(user.email, user.name, slotId, 'reserve', timestamp);
      
      await fetchSlots();
      alert(`Slot ${slotId} booked successfully! Check your email for confirmation.`);
    } catch (error) {
      setError('Failed to reserve slot');
      console.error('Error:', error);
    }
  };

  const handleAdvanceBooking = (slot) => {
    const userHasSlot = slots.some(s => 
      s.action === 'occupied' && s.rfid === user.email
    );

    if (userHasSlot) {
      alert('You already have a slot booked. Please free your current slot first.');
      return;
    }

    setSelectedSlot(slot);
    setShowCalendar(true);
  };

  const handleFree = async (slotId) => {
    const slot = slots.find(s => s.slotId === slotId);
    
    if (slot.rfid !== user.email) {
      alert('You can only free your own slots!');
      return;
    }

    try {
      await freeSlot(slotId);
      
      const timestamp = new Date().toISOString();
      await sendBookingEmail(user.email, user.name, slotId, 'free', timestamp);
      
      await fetchSlots();
      alert(`Slot ${slotId} freed successfully!`);
    } catch (error) {
      setError('Failed to free slot');
      console.error('Error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading slots...</div>;
  }

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <div className="realtime-indicator">
        <span className="pulse-dot"></span>
        <span>Live Updates</span>
        <span className="last-update">Last updated: {lastUpdate.toLocaleTimeString()}</span>
      </div>
      <h2>Parking Slots</h2>
      <div className="slot-list-grid">
        {slots.map((slot) => {
          const isMySlot = slot.rfid === user.email;
          
          return (
            <div
              key={slot.slotId}
              className={`card ${isMySlot ? 'my-slot' : ''}`}
            >
              <p><strong>ID:</strong> {slot.slotId}</p>
              <p><strong>Status:</strong> {slot.action}</p>
              <p><strong>RFID:</strong> {slot.rfid || '-'}</p>
              {/* <p><strong>Time:</strong> {new Date(slot.timestamp).toLocaleTimeString()}</p> */}
              
              {isMySlot && (
                <span className="my-slot-badge">Your Slot</span>
              )}
              
              {slot.action === 'free' ? (
                <div className="booking-options">
                  <button 
                    className="reserve-btn" 
                    onClick={() => handleQuickReserve(slot.slotId)}
                  >
                    Book Now
                  </button>
                  <button 
                    className="advance-btn" 
                    onClick={() => handleAdvanceBooking(slot)}
                  >
                    📅 Schedule Later
                  </button>
                </div>
              ) : isMySlot ? (
                <button 
                  className="free-btn" 
                  onClick={() => handleFree(slot.slotId)}
                >
                  Free My Slot
                </button>
              ) : (
                <button 
                  className="occupied-btn" 
                  disabled
                >
                  Occupied
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showCalendar && selectedSlot && (
        <BookingCalendar
          slot={selectedSlot}
          onClose={() => {
            setShowCalendar(false);
            setSelectedSlot(null);
          }}
          onSuccess={() => {
            setShowCalendar(false);
            setSelectedSlot(null);
            fetchSlots();
          }}
        />
      )}
    </div>
  );
};

export default SlotList;