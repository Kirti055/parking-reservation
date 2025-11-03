import React, { useState, useEffect } from "react";
import { getParkingLots } from "../api/parkingApi";

const ParkingLotSelectPage = ({ onSelectLot }) => {
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const data = await getParkingLots();
      setLots(data);
    } catch (error) {
      console.error("Error fetching parking lots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (lot) => {
    setSelected(lot);
    onSelectLot(lot);
    localStorage.setItem("selectedParkingLot", JSON.stringify(lot));
  };

  if (loading) return <div>Loading parking lots...</div>;

  return (
    <div className="lot-select-page">
      <h1>Choose a Parking Lot</h1>
      <p>Select the location you want to book slots in.</p>

      <div className="lot-list">
        {lots.map((lot) => (
          <div
            key={lot.lotId}
            className={`lot-card ${selected?.lotId === lot.lotId ? "selected" : ""}`}
            onClick={() => handleSelect(lot)}
          >
            <h3>{lot.name}</h3>
            <p>Capacity: {lot.capacity}</p>
            {lot.location && (
              <p>
                📍 {lot.location.lat}, {lot.location.lng}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParkingLotSelectPage;
