const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper function to get authentication headers
const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(user.token && { 'Authorization': `Bearer ${user.token}` })
  };
};

export const getSlots = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/slots`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch slots');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};

export const reserveSlot = async (slotId, rfid) => {
  try {
    const response = await fetch(`${API_BASE_URL}/reserve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId, rfid }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reserve slot');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error reserving slot:', error);
    throw error;
  }
};

export const freeSlot = async (slotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/free`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to free slot');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error freeing slot:', error);
    throw error;
  }
};

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

    if (!response.ok) {
      throw new Error('Failed to schedule booking');
    }

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

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};