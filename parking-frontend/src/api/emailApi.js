const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const sendBookingEmail = async (userEmail, userName, slotId, action, timestamp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userEmail,
        userName,
        slotId,
        action,
        timestamp
      }),
    });

    if (!response.ok) {
      console.error('Failed to send email notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
  }
};