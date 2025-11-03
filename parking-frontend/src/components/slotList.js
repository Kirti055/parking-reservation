// src/components/SlotList.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getSlots, reserveSlot, freeSlot } from "../api/parkingApi";
import { sendBookingEmail } from "../api/emailApi";
import BookingCalendar from "./BookingCalendar";

const SlotList = ({ selectedLot, onBack }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');

  // ✅ Use useCallback to prevent useEffect warning
  const fetchSlots = useCallback(async () => {
    if (!selectedLot?.lotId) return;

    setLoading(true);
    try {
      const data = await getSlots(selectedLot.lotId);
      setSlots(data);
      setError('');
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load slots');
    } finally {
      setLoading(false);
    }
  }, [selectedLot?.lotId]);

  // Real-time polling effect
  useEffect(() => {
    fetchSlots();
    const interval = setInterval(() => fetchSlots(), 5000);
    return () => clearInterval(interval);
  }, [fetchSlots]);

  const incrementReservationCount = () => {
    const countKey = `reservations_${user.email}`;
    const currentCount = parseInt(localStorage.getItem(countKey) || '0', 10);
    localStorage.setItem(countKey, (currentCount + 1).toString());
  };

  const handleQuickReserve = async (slotId) => {
    const userHasSlot = slots.some(s => s.action === 'occupied' && s.rfid === user.email);
    if (userHasSlot) {
      alert('You already have a slot booked. Free your current slot before booking another.');
      return;
    }

    try {
      await reserveSlot(slotId, user.email, selectedLot.lotId); // pass lotId
      incrementReservationCount();

      const timestamp = new Date().toISOString();
      await sendBookingEmail(user.email, user.name, slotId, 'reserve', timestamp);

      await fetchSlots();
      alert(`Slot ${slotId} booked successfully! Check your email for confirmation.`);
    } catch (err) {
      console.error('Error reserving slot:', err);
      setError('Failed to reserve slot');
    }
  };

  const handleAdvanceBooking = (slot) => {
    const userHasSlot = slots.some(s => s.action === 'occupied' && s.rfid === user.email);
    if (userHasSlot) {
      alert('You already have a slot booked. Free your current slot before scheduling another.');
      return;
    }

    setSelectedSlot(slot);
    setShowCalendar(true);
  };

  const handleFree = async (slotId) => {
    const slot = slots.find(s => s.slotId === slotId);
    if (!slot || slot.rfid !== user.email) {
      alert('You can only free your own slots!');
      return;
    }

    try {
      await freeSlot(slotId, selectedLot.lotId); // pass lotId
      const timestamp = new Date().toISOString();
      await sendBookingEmail(user.email, user.name, slotId, 'free', timestamp);

      await fetchSlots();
      alert(`Slot ${slotId} freed successfully!`);
    } catch (err) {
      console.error('Error freeing slot:', err);
      setError('Failed to free slot');
    }
  };

  if (loading) return <div className="loading">Loading slots...</div>;

  const availableSlots = slots.filter(s => s.action === 'free').length;
  const occupiedSlots = slots.filter(s => s.action === 'occupied').length;

  return (
    <div>
      {/* Parking Lot Header */}
      <div className="parking-lot-header">
        <button onClick={onBack} className="back-button">← Back to Parking Lots</button>
        <div className="lot-info">
          <h2>{selectedLot?.name || 'Parking Slots'}</h2>
          <p>Select an available slot to reserve</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card available">
          <span className="stat-number">{availableSlots}</span>
          <span className="stat-label">Available</span>
        </div>
        <div className="stat-card occupied">
          <span className="stat-number">{occupiedSlots}</span>
          <span className="stat-label">Occupied</span>
        </div>
        <div className="stat-card total">
          <span className="stat-number">{slots.length}</span>
          <span className="stat-label">Total Slots</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="realtime-indicator">
        <span className="pulse-dot"></span>
        <span>Live Updates</span>
        <span className="last-update">Last updated: {lastUpdate.toLocaleTimeString()}</span>
      </div>

      <div className="slot-list-grid">
        {slots.map(slot => {
          const isMySlot = slot.rfid === user.email;

          return (
            <div key={`${slot.slotId}-${selectedLot.lotId}`} className={`card ${isMySlot ? 'my-slot' : ''}`}>
              <p><strong>ID:</strong> {slot.slotId}</p>
              <p><strong>Status:</strong> {slot.action}</p>
              <p><strong>RFID:</strong> {slot.rfid || '-'}</p>

              {isMySlot && <span className="my-slot-badge">Your Slot</span>}

              {slot.action === 'free' ? (
                <div className="booking-options">
                  <button className="reserve-btn" onClick={() => handleQuickReserve(slot.slotId)}>Book Now</button>
                  <button className="advance-btn" onClick={() => handleAdvanceBooking(slot)}>📅 Schedule Later</button>
                </div>
              ) : isMySlot ? (
                <button className="free-btn" onClick={() => handleFree(slot.slotId)}>Free My Slot</button>
              ) : (
                <button className="occupied-btn" disabled>Occupied</button>
              )}
            </div>
          );
        })}
      </div>

      {showCalendar && selectedSlot && (
        <BookingCalendar
          slot={selectedSlot}
          lotId={selectedLot.lotId}
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