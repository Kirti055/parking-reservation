const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(user.token && { 'Authorization': `Bearer ${user.token}` })
  };
};

// Add Slot (requires lotId + slotId)
export const addSlot = async (slotId, lotId) => {
  try {
    console.log('API Call - Adding slot:', { slotId, lotId }); // DEBUG
    
    const response = await fetch(`${API_BASE_URL}/admin/slots/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId, lotId }),
    });

    const data = await response.json();
    console.log('API Response:', data); // DEBUG

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add slot');
    }

    return data;
  } catch (error) {
    console.error('addSlot error:', error);
    throw error;
  }
};

// Delete Slot (requires lotId + slotId)
export const deleteSlot = async (slotId, lotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/slots/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId, lotId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete slot');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};