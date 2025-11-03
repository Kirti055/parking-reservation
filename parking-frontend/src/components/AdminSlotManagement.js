import React, { useState, useEffect } from "react";
import { getSlots, getAllParkingLots } from "../api/parkingApi";
import { addSlot, deleteSlot } from "../api/adminApi";

const AdminSlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [parkingLots, setParkingLots] = useState([]);
  const [filteredLotId, setFilteredLotId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotId, setNewSlotId] = useState('');
  const [selectedLotId, setSelectedLotId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSlots();
    fetchParkingLots();
  }, []);

  const fetchSlots = async () => {
    try {
      const data = await getSlots();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const fetchParkingLots = async () => {
    try {
      const lots = await getAllParkingLots();
      setParkingLots(lots);
      if (lots.length > 0) setSelectedLotId(lots[0].lotId);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newSlotId.trim()) return setError('Slot ID is required');
    if (!selectedLotId) return setError('Please select a parking lot');

    try {
      await addSlot(newSlotId.toUpperCase(), selectedLotId);
      setSuccess(`Slot ${newSlotId.toUpperCase()} added successfully!`);
      setNewSlotId('');
      setShowAddModal(false);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotId, lotId) => {
    if (!window.confirm(`Are you sure you want to delete slot ${slotId}?`)) return;

    try {
      await deleteSlot(slotId, lotId);
      setSuccess(`Slot ${slotId} deleted successfully!`);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete slot');
    }
  };

  const getParkingLotName = (lotId) => {
    const lot = parkingLots.find(l => l.lotId === lotId);
    return lot ? lot.name : lotId || 'Unknown';
  };

  const filteredSlots = filteredLotId === 'all' ? slots : slots.filter(s => s.lotId === filteredLotId);

  const getSlotCounts = (lotId) => {
    const lotSlots = slots.filter(s => s.lotId === lotId);
    const occupied = lotSlots.filter(s => s.action === 'occupied').length;
    const free = lotSlots.filter(s => s.action === 'free').length;
    return { total: lotSlots.length, occupied, free };
  };

  if (loading) return <div className="loading">Loading slots...</div>;

  return (
    <div className="admin-slot-management">
      <div className="management-header">
        <h2>Slot Management</h2>
        <button className="add-slot-btn" onClick={() => setShowAddModal(true)}>+ Add New Slot</button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="filter-section">
        <label htmlFor="lot-filter">Filter by Parking Lot:</label>
        <select id="lot-filter" value={filteredLotId} onChange={e => setFilteredLotId(e.target.value)}>
          <option value="all">All Parking Lots ({slots.length} slots)</option>
          {parkingLots.map(lot => {
            const counts = getSlotCounts(lot.lotId);
            return <option key={lot.lotId} value={lot.lotId}>{lot.name} ({counts.total} slots - {counts.free} free, {counts.occupied} occupied)</option>
          })}
        </select>
      </div>

      <div className="slots-summary">
        <div className="summary-card">
          <h4>Total Slots</h4>
          <p className="summary-number">{filteredSlots.length}</p>
        </div>
        <div className="summary-card free">
          <h4>Free Slots</h4>
          <p className="summary-number">{filteredSlots.filter(s => s.action === 'free').length}</p>
        </div>
        <div className="summary-card occupied">
          <h4>Occupied Slots</h4>
          <p className="summary-number">{filteredSlots.filter(s => s.action === 'occupied').length}</p>
        </div>
      </div>

      <div className="slots-table-container">
        <table className="slots-table">
          <thead>
            <tr>
              <th>Slot ID</th>
              <th>Parking Lot</th>
              <th>Status</th>
              <th>RFID</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSlots.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No slots found.</td>
              </tr>
            ) : filteredSlots.map(slot => (
              <tr key={`${slot.lotId}-${slot.slotId}`}>
                <td>{slot.slotId}</td>
                <td>{getParkingLotName(slot.lotId)}</td>
                <td><span className={`status-badge ${slot.action}`}>{slot.action}</span></td>
                <td>{slot.rfid || '-'}</td>
                <td>{new Date(slot.timestamp).toLocaleString()}</td>
                <td>
                  <button className="delete-slot-btn" onClick={() => handleDeleteSlot(slot.slotId, slot.lotId)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Add New Parking Slot</h3>
            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label>Parking Lot *</label>
                <select value={selectedLotId} onChange={e => setSelectedLotId(e.target.value)} required>
                  {parkingLots.length === 0 ? <option value="">No parking lots available</option> :
                    parkingLots.map(lot => <option key={lot.lotId} value={lot.lotId}>{lot.name}</option>)}
                </select>
              </div>
              
              <div className="form-group">
                <label>Slot ID *</label>
                <input type="text" value={newSlotId} onChange={e => setNewSlotId(e.target.value)} placeholder="e.g., SLOT-05" required />
                <small>Format: SLOT-XX (will be converted to uppercase)</small>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="submit-btn" disabled={parkingLots.length === 0}>Add Slot</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlotManagement;