import React, { useState, useEffect } from "react";
import { getSlots } from "../api/parkingApi";
import { addSlot, deleteSlot } from "../api/adminApi";

const AdminSlotManagement = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlotId, setNewSlotId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSlots();
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

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newSlotId.trim()) {
      setError('Slot ID is required');
      return;
    }

    try {
      await addSlot(newSlotId.toUpperCase());
      setSuccess(`Slot ${newSlotId.toUpperCase()} added successfully!`);
      setNewSlotId('');
      setShowAddModal(false);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add slot');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm(`Are you sure you want to delete slot ${slotId}?`)) {
      return;
    }

    try {
      await deleteSlot(slotId);
      setSuccess(`Slot ${slotId} deleted successfully!`);
      fetchSlots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete slot');
    }
  };

  if (loading) {
    return <div className="loading">Loading slots...</div>;
  }

  return (
    <div className="admin-slot-management">
      <div className="management-header">
        <h2>Slot Management</h2>
        <button className="add-slot-btn" onClick={() => setShowAddModal(true)}>
          + Add New Slot
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="slots-table-container">
        <table className="slots-table">
          <thead>
            <tr>
              <th>Slot ID</th>
              <th>Status</th>
              <th>RFID</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => (
              <tr key={slot.slotId}>
                <td className="slot-id">{slot.slotId}</td>
                <td>
                  <span className={`status-badge ${slot.action}`}>
                    {slot.action}
                  </span>
                </td>
                <td>{slot.rfid || '-'}</td>
                <td>{new Date(slot.timestamp).toLocaleString()}</td>
                <td>
                  <button
                    className="delete-slot-btn"
                    onClick={() => handleDeleteSlot(slot.slotId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Parking Slot</h3>
            <form onSubmit={handleAddSlot}>
              <div className="form-group">
                <label>Slot ID *</label>
                <input
                  type="text"
                  value={newSlotId}
                  onChange={(e) => setNewSlotId(e.target.value)}
                  placeholder="e.g., SLOT-05"
                  required
                />
                <small>Format: SLOT-XX (will be converted to uppercase)</small>
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  Add Slot
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSlotManagement;