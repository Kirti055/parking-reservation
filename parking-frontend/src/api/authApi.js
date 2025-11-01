const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://your-api-gateway-url.amazonaws.com/dev';

export const loginUser = async (email, password, role) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser'));
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users;
  } catch (error) {
    throw error;
  }
};

export const getSystemStats = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser'));
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    const data = await response.json();
    return data.stats;
  } catch (error) {
    throw error;
  }
};

export const getUserReservationHistory = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('parkingUser'));
    if (!user || !user.token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_BASE_URL}/user/reservations`, {
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reservation history');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Fallback to localStorage if API not available
    const user = JSON.parse(localStorage.getItem('parkingUser'));
    const count = parseInt(localStorage.getItem(`reservations_${user?.email}`) || '0');
    return { totalReservations: count };
  }
};