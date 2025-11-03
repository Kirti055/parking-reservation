// src/components/SelectParkingLot.jsx
import React, { useState, useEffect } from 'react';
import { getAllParkingLots } from '../api/parkingApi';

const SelectParkingLot = ({ onSelectLot }) => {
  const [parkingLots, setParkingLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      setLoading(true);
      setError(null);
      const lots = await getAllParkingLots();
      setParkingLots(lots);
    } catch (err) {
      console.error('Error fetching parking lots:', err);
      setError('Failed to load parking lots. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
  };

  const handleContinue = () => {
    if (selectedLot) {
      localStorage.setItem('selectedParkingLot', JSON.stringify(selectedLot));
      onSelectLot(selectedLot);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading parking lots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={fetchParkingLots} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="select-parking-lot">
      <h2>Select a Parking Lot</h2>
      <p className="subtitle">Choose where you want to park</p>

      {parkingLots.length === 0 ? (
        <div className="no-lots">
          <p>No parking lots available at the moment.</p>
        </div>
      ) : (
        <>
          <div className="parking-lots-grid">
            {parkingLots.map((lot) => (
              <div
                key={lot.lotId}
                onClick={() => handleSelectLot(lot)}
                className={`parking-lot-card ${
                  selectedLot?.lotId === lot.lotId ? 'selected' : ''
                }`}
              >
                <div className="card-header">
                  <h3>{lot.name}</h3>
                  {selectedLot?.lotId === lot.lotId && (
                    <span className="selected-badge">✓</span>
                  )}
                </div>
                
                <div className="card-body">
                  <div className="info-row">
                    <span className="label">🚗 Capacity:</span>
                    <span className="value">{lot.capacity} spaces</span>
                  </div>
                  
                  {lot.location && (
                    <div className="info-row">
                      <span className="label">📍 Location:</span>
                      <span className="value">
                        {lot.location.lat.toFixed(4)}, {lot.location.lng.toFixed(4)}
                      </span>
                    </div>
                  )}
                  
                  {/* <div className="info-row">
                    <span className="label">🕐 Created:</span>
                    <span className="value">
                      {new Date(lot.createdAt).toLocaleDateString()}
                    </span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {selectedLot && (
            <div className="continue-section">
              <button onClick={handleContinue} className="continue-button">
                Continue to Slot Selection →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SelectParkingLot;