// src/components/chatbot/AppointmentChatbotForm.jsx (ĐÃ SỬA ĐỔI)
import { useState, useEffect } from 'react';
// Đã bỏ useSearchParams và useNavigate vì form là Modal

// Component giờ nhận onClose và initialUrl qua props
export default function AppointmentChatbotForm({ onClose, initialUrl }) {
  const [sessionId, setSessionId] = useState('unknown');

  // Parse sessionId từ URL nhận được
  useEffect(() => {
    if (initialUrl) {
      // Logic bóc tách sessionId từ URL (ví dụ: http://.../?session=user-xxx)
      try {
        const urlParams = new URLSearchParams(new URL(initialUrl).search);
        const session = urlParams.get('session') || 'unknown';
        setSessionId(session);
      } catch (e) {
        console.error("Lỗi parse URL:", e);
        setSessionId('unknown');
      }
    }
  }, [initialUrl]);

  const [formData, setFormData] = useState({
    patient_name: '',
    phone: '',
    email: '',
    appointment_time: '',
    notes: '',
    chat_id: 'unknown'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Cập nhật chat_id khi sessionId thay đổi
  useEffect(() => {
    setFormData(prev => ({ ...prev, chat_id: sessionId }));
  }, [sessionId]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Kiểm tra lại chat_id trước khi gửi (đảm bảo đã cập nhật)
    const dataToSend = { ...formData, chat_id: sessionId };
    
    try {
      const res = await fetch('https://n8n.quanliduan-pms.site/webhook-test/appointment-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      const data = await res.json();
      setResult({ success: true, code: data.code });
    } catch (err) {
      setResult({ success: false, message: 'Lỗi kết nối. Vui lòng thử lại!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    // Bỏ các class căn giữa (max-w-2xl mx-auto) vì nó là Modal bên trong cửa sổ chat
    <div className="h-full flex flex-col"> 
      {/* Header + Nút quay lại */}
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold">Đặt lịch khám Tai Mũi Họng</h2>
        <button
          // Sử dụng prop onClose để đóng Modal
          onClick={onClose} 
          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      <p className="text-center text-gray-600 mb-6 flex-shrink-0">Vui lòng điền thông tin để đặt lịch</p>

      {/* Form (Cuộn nếu cần) */}
      <div className="flex-1 overflow-y-auto pr-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="chat_id" value={sessionId} />

          {/* ... Các trường input giữ nguyên ... */}
          {/* (Họ tên, SĐT, Email, Thời gian khám, Ghi chú) */}
          
          <div>
            <label className="block text-sm font-medium mb-1">Họ và tên <span className="text-red-500">*</span></label>
            <input type="text" name="patient_name" required value={formData.patient_name} onChange={handleChange} placeholder="Nguyễn Văn A" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại <span className="text-red-500">*</span></label>
            <input type="tel" name="phone" required pattern="[0-9]{10}" value={formData.phone} onChange={handleChange} placeholder="0901234567" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="example@email.com" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Thời gian khám mong muốn <span className="text-red-500">*</span></label>
            <input type="datetime-local" name="appointment_time" required value={formData.appointment_time} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ghi chú (tình trạng bệnh, yêu cầu bác sĩ...)</label>
            <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Mô tả triệu chứng hoặc yêu cầu cụ thể..." className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"/>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Đang gửi...' : 'Gửi đặt lịch'}
          </button>
        </form>
      </div> 

      {/* Kết quả */}
      {result && (
        <div className={`mt-6 p-4 rounded-md text-center font-medium flex-shrink-0 ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {result.success ? (
            <>
              <p>Đặt lịch thành công! Mã lịch: <strong>{result.code}</strong></p>
              <button
                // Sử dụng prop onClose để đóng Modal
                onClick={onClose} 
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
              >
                Quay lại chat
              </button>
            </>
          ) : (
            <p>{result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}