
import AppointmentChatbotForm from '../../components/chatbot/AppointmentChatbotForm';
import { useNavigate } from 'react-router-dom';

export default function AppointmentChatbotPage() {
  const navigate = useNavigate();
  return (
    <div className="py-12 bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Đặt lịch khám</h1>
        </div>
        <AppointmentChatbotForm /> 
      </div>
    </div>
  );
}