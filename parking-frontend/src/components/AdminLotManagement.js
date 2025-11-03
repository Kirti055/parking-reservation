import React, { useState, useEffect } from "react";
import { getAllParkingLots, addParkingLot, updateParkingLot, deleteParkingLot } from "../api/parkingApi";

const AdminLotManagement = () => {
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    lat: '',
    lng: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchParkingLots();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const lots = await getAllParkingLots();
      setParkingLots(lots);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      setError('Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (lot = null) => {
    if (lot) {
      setEditingLot(lot);
      setFormData({
        name: lot.name,
        capacity: lot.capacity,
        lat: lot.location?.lat || '',
        lng: lot.location?.lng || ''
      });
    } else {
      setEditingLot(null);
      setFormData({ name: '', capacity: '', lat: '', lng: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingLot(null);
    setFormData({ name: '', capacity: '', lat: '', lng: '' });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.capacity) {
      setError('Name and capacity are required');
      return;
    }

    try {
      const lotData = {
        name: formData.name,
        capacity: parseInt(formData.capacity)
      };

      if (formData.lat && formData.lng) {
        lotData.location = {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        };
      }

      if (editingLot) {
        await updateParkingLot(editingLot.lotId, lotData);
        setSuccess('Parking lot updated successfully!');
      } else {
        await addParkingLot(lotData);
        setSuccess('Parking lot added successfully!');
      }

      handleCloseModal();
      fetchParkingLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save parking lot');
    }
  };

  const handleDelete = async (lotId, lotName) => {
    if (!window.confirm(`Are you sure you want to delete ${lotName}? This will not delete the slots inside.`)) {
      return;
    }

    try {
      await deleteParkingLot(lotId);
      setSuccess('Parking lot deleted successfully!');
      fetchParkingLots();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete parking lot');
    }
  };

  if (loading) {
    return <div className="loading">Loading parking lots...</div>;
  }

  return (
    <div className="admin-lot-management">
      <div className="management-header">
        <h2>Parking Lot Management</h2>
        <button className="add-btn" onClick={() => handleOpenModal()}>
          + Add New Parking Lot
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {parkingLots.length === 0 ? (
        <div className="no-lots">
          <p>No parking lots yet. Click "Add New Parking Lot" to create one.</p>
        </div>
      ) : (
        <div className="lots-grid">
          {parkingLots.map((lot) => (
            <div key={lot.lotId} className="lot-card">
              <div className="lot-header">
                <h3>{lot.name}</h3>
                <div className="lot-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleOpenModal(lot)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(lot.lotId, lot.name)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="lot-details">
                <p><strong>Capacity:</strong> {lot.capacity} spaces</p>
                {lot.location && (
                  <p><strong>Location:</strong> {lot.location.lat.toFixed(4)}, {lot.location.lng.toFixed(4)}</p>
                )}
                <p><strong>Created:</strong> {new Date(lot.createdAt).toLocaleDateString()}</p>
                <p className="lot-id"><strong>ID:</strong> {lot.lotId}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingLot ? 'Edit Parking Lot' : 'Add New Parking Lot'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Mall A Parking"
                  required
                />
              </div>

              <div className="form-group">
                <label>Capacity *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  placeholder="e.g., 100"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Latitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  placeholder="e.g., 40.7128"
                />
              </div>

              <div className="form-group">
                <label>Longitude (optional)</label>
                <input
                  type="number"
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  placeholder="e.g., -74.0060"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="submit-btn">
                  {editingLot ? 'Update' : 'Add'} Parking Lot
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
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

export default AdminLotManagement;