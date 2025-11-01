const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem('parkingUser') || '{}');
  return {
    'Content-Type': 'application/json',
    ...(user.token && { 'Authorization': `Bearer ${user.token}` })
  };
};

export const addSlot = async (slotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/slots/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add slot');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteSlot = async (slotId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/slots/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ slotId }),
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