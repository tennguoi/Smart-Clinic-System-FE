const API_BASE_URL = 'http://localhost:8082';

const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const paymentApi = {
  // Tạo thanh toán mới
  createPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Lấy danh sách thanh toán theo bệnh nhân
  getPaymentsByPatient: async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/patient/${patientId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payments by patient:', error);
      throw error;
    }
  },

  // Lấy thông tin thanh toán theo ID
  getPaymentById: async (paymentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment by ID:', error);
      throw error;
    }
  },

  // Tính tổng tiền cần thanh toán cho queue
  calculateTotalAmount: async (queueId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/queue/${queueId}/calculate`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calculating total amount:', error);
      throw error;
    }
  }
};

// Helper functions
export const formatPaymentMethod = (method) => {
  const methodMap = {
    'Cash': 'Tiền mặt',
    'Card': 'Thẻ',
    'BankTransfer': 'Chuyển khoản'
  };
  return methodMap[method] || method;
};

export const formatPaymentStatus = (status) => {
  const statusMap = {
    'Pending': 'Chờ thanh toán',
    'Completed': 'Đã thanh toán',
    'Cancelled': 'Đã hủy',
    'Refunded': 'Đã hoàn tiền'
  };
  return statusMap[status] || status;
};

export const formatCurrency = (amount) => {
  if (!amount) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

