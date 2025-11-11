// src/api/doctorApi.js
const API_BASE_URL = 'http://localhost:8082';

/**
 * 🩺 Lấy danh sách tất cả bác sĩ (public endpoint)
 * @returns {Promise<Array>} Danh sách bác sĩ
 */
export const getDoctors = async () => {
  try {
    const url = `${API_BASE_URL}/api/public/doctors`;
    console.log('Fetching doctors from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Doctors data:', data);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

export default {
  getDoctors,
};
