// src/api/parkingApi.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to get authentication headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(user.token && { 'Authorization': `Bearer ${user.token}` })
  };
};

// ============ Parking Lots API ============

export const getAllParkingLots = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/parking-lots`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch parking lots');
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error fetching parking lots:', error);
    throw error;
  }
};

export const addParkingLot = async (lotData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parking-lots`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(lotData),
    });
    if (!response.ok) throw new Error('Failed to add parking lot');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error adding parking lot:', error);
    throw error;
  }
};

export const updateParkingLot = async (lotId, updates) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parking-lots/${lotId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update parking lot');
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating parking lot:', error);
    throw error;
  }
};

export const deleteParkingLot = async (lotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/parking-lots/${lotId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete parking lot');
    return await response.json();
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    throw error;
  }
};

// ============ Slots API (old style, with lotId support) ============

export const getSlots = async (lotId) => {
  try {
    // Fetch all slots and filter by lotId on frontend (if lotId provided)
    const response = await fetch(`${API_BASE_URL}/slots`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch slots');
    let data = await response.json();

    if (lotId) {
      data = data.filter(slot => slot.lotId === lotId);
    }

    return data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};

export const reserveSlot = async (slotId, rfid, lotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reserve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId, rfid, lotId }), // include lotId
    });
    if (!response.ok) throw new Error('Failed to reserve slot');
    return await response.json();
  } catch (error) {
    console.error('Error reserving slot:', error);
    throw error;
  }
};

export const freeSlot = async (slotId, lotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/free`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId, lotId }), // include lotId
    });
    if (!response.ok) throw new Error('Failed to free slot');
    return await response.json();
  } catch (error) {
    console.error('Error freeing slot:', error);
    throw error;
  }
};

// ============ Future Booking & User Bookings ============

export const scheduleFutureBooking = async (bookingDetails) => {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');
    const response = await fetch(`${API_BASE_URL}/bookings/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(user.token && { 'Authorization': `Bearer ${user.token}` })
      },
      body: JSON.stringify(bookingDetails),
    });
    if (!response.ok) throw new Error('Failed to schedule booking');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getUserBookings = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');
    const response = await fetch(`${API_BASE_URL}/bookings/user/${user.email}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(user.token && { 'Authorization': `Bearer ${user.token}` })
      },
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return await response.json();
  } catch (error) {
    throw error;
  }
};