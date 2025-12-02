import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Menu, Plus, Loader2, AlertCircle } from 'lucide-react';

export default function AIAssistantPanel() {
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào bác sĩ!\nTôi là AI Trợ Lý Y Tế thông minh.\nBạn cần hỗ trợ chẩn đoán, kê đơn hay giải thích kết quả?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const historyRef = useRef(null);

  const API_BASE_URL = 'http://localhost:8082/api/v1/tmh-assistant';

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Click ngoài để đóng lịch sử
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showHistory && historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHistory]);

  // Load lịch sử khi mở sidebar
  useEffect(() => {
    if (showHistory) {
      loadConversationHistory();
    }
  }, [showHistory]);

  // Lấy thông tin bác sĩ từ localStorage
  const getDoctorInfo = () => {
    try {
      const userInfoStr = localStorage.getItem('user_info');
      if (!userInfoStr) {
        throw new Error('Không tìm thấy thông tin bác sĩ');
      }
      const userInfo = JSON.parse(userInfoStr);
      console.log('👤 Doctor Info:', userInfo);
      return userInfo.userId;
    } catch (err) {
      console.error('❌ Lỗi lấy thông tin bác sĩ:', err);
      return null;
    }
  };

  // Lấy auth token
  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('❌ Không tìm thấy auth token');
      setError('Vui lòng đăng nhập lại');
    }
    return token;
  };

  // Load lịch sử trò chuyện từ backend
  const loadConversationHistory = async () => {
    const doctorId = getDoctorInfo();
    const authToken = getAuthToken();
    
    if (!doctorId || !authToken) {
      console.error('❌ Thiếu doctorId hoặc authToken');
      return;
    }

    setLoadingHistory(true);
    setError(null);

    try {
      console.log('📡 Đang gọi API lấy lịch sử...');
      
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Doctor-Id': doctorId,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Lịch sử trò chuyện:', data);
      
      // Backend trả về array: [{ conversationId, sessionId, startedAt, messageCount, firstMessage }]
      setConversationHistory(data || []);

      if (data.length === 0) {
        console.log('ℹ️ Chưa có lịch sử trò chuyện');
      }

    } catch (error) {
      console.error('❌ Lỗi load lịch sử:', error);
      setError(`Không thể tải lịch sử: ${error.message}`);
      setConversationHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Tạo cuộc trò chuyện mới
  const createNewConversation = () => {
    console.log('➕ Tạo cuộc trò chuyện mới');
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'Xin chào bác sĩ!\nTôi là AI Trợ Lý Y Tế thông minh.\nBạn cần hỗ trợ chẩn đoán, kê đơn hay giải thích kết quả?',
        timestamp: new Date(),
      }
    ]);
    setCurrentConversationId(null);
    setShowHistory(false);
    setError(null);
  };

  // Xem lại cuộc trò chuyện cũ
  const loadConversation = async (conversationId) => {
    const authToken = getAuthToken();
    const doctorId = getDoctorInfo();
    
    if (!authToken || !doctorId) return;

    console.log('📖 Đang load conversation:', conversationId);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-Doctor-Id': doctorId,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Load conversation response:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('💬 Chi tiết cuộc trò chuyện:', data);
      
      // Backend trả về: { conversationId, sessionId, startedAt, messages: [...] }
      // messages = [{ messageId, sender, message, sentAt }]
      
      if (!data.messages || data.messages.length === 0) {
        console.warn('⚠️ Cuộc trò chuyện không có tin nhắn');
        setMessages([{
          id: 'empty',
          role: 'assistant',
          content: 'Cuộc trò chuyện này chưa có tin nhắn.',
          timestamp: new Date()
        }]);
      } else {
        const formattedMessages = data.messages.map(msg => ({
          id: msg.messageId,
          role: msg.sender === 'User' ? 'doctor' : 'assistant',
          content: msg.message,
          timestamp: new Date(msg.sentAt)
        }));
        
        console.log('✅ Đã format', formattedMessages.length, 'tin nhắn');
        setMessages(formattedMessages);
      }
      
      setCurrentConversationId(conversationId);
      setShowHistory(false);

    } catch (error) {
      console.error('❌ Lỗi load conversation:', error);
      setError(`Không thể tải cuộc trò chuyện: ${error.message}`);
    }
  };

  // Gửi tin nhắn cho AI
  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const doctorId = getDoctorInfo();
    const authToken = getAuthToken();

    if (!doctorId || !authToken) {
      setError('Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.');
      return;
    }

    const userMsgObj = {
      id: 'user-' + Date.now(),
      role: 'doctor',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsgObj]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Gửi tin nhắn đến backend:', userMessage);

      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-Doctor-Id': doctorId
        },
        body: JSON.stringify({
          text: userMessage
        })
      });

      console.log('📡 Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.reply || errorData.error || `HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Response từ backend:', data);

      // Backend trả về { reply, conversationId } 
      // ChatResponse trong Java có field "reply" chứ không phải "output"
      const aiReply = data.reply || 'Tôi đang xử lý thông tin...';

      // Update conversationId nếu là conversation mới
      if (data.conversationId && !currentConversationId) {
        setCurrentConversationId(data.conversationId);
        console.log('🆔 Set conversationId:', data.conversationId);
      }

      setMessages(prev => [...prev, {
        id: 'ai-' + Date.now(),
        role: 'assistant',
        content: aiReply,
        timestamp: new Date()
      }]);

      // Reload lịch sử nếu sidebar đang mở
      if (showHistory) {
        loadConversationHistory();
      }

    } catch (error) {
      console.error('❌ Lỗi gửi tin nhắn:', error);
      
      let errorMsg = 'AI đang bận, vui lòng thử lại sau ít phút.';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMsg = 'Không kết nối được với Backend. Vui lòng kiểm tra mạng.';
      } else if (error.message.includes('401')) {
        errorMsg = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.message.includes('403')) {
        errorMsg = 'Bạn không có quyền sử dụng tính năng này.';
      } else if (error.message.includes('500')) {
        errorMsg = 'Backend gặp lỗi. Vui lòng thử lại.';
      }

      setError(errorMsg);
      setMessages(prev => [...prev, {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: `❌ ${errorMsg}`,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 lg:p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              title="Lịch sử trò chuyện"
            >
              <Menu className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 lg:border-3 border-white animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-base lg:text-lg font-bold text-gray-900">AI Trợ Lý Y Tế</h3>
                <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {isLoading ? 'Đang suy nghĩ...' : 'Sẵn sàng hỗ trợ'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sidebar lịch sử */}
      {showHistory && (
        <div ref={historyRef} className="w-64 lg:w-80 bg-white border-r border-gray-200 absolute inset-y-0 left-0 z-20 shadow-2xl flex flex-col">
          <div className="p-4 lg:p-5 border-b border-gray-200">
            <button 
              onClick={createNewConversation}
              className="w-full flex items-center justify-center gap-2 py-3 lg:py-3.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all shadow-md text-sm lg:text-base"
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Cuộc trò chuyện mới
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 lg:p-4">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="mt-2 text-sm text-gray-600">Đang tải...</span>
              </div>
            ) : conversationHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-xs lg:text-sm font-medium">Chưa có lịch sử trò chuyện</p>
                <p className="text-xs mt-2">Bắt đầu cuộc trò chuyện đầu tiên!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversationHistory.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => loadConversation(conv.conversationId)}
                    className={`w-full text-left p-3 rounded-lg transition-all hover:bg-blue-50 border ${
                      currentConversationId === conv.conversationId
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : 'bg-gray-50 border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* Sử dụng firstMessage từ backend thay vì conv.messages */}
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {conv.firstMessage 
                            ? (conv.firstMessage.length > 40 
                                ? conv.firstMessage.substring(0, 40) + '...' 
                                : conv.firstMessage)
                            : 'Cuộc trò chuyện'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(conv.startedAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {/* Sử dụng messageCount từ backend */}
                        <p className="text-xs text-blue-600 mt-1 font-medium">
                          {conv.messageCount || 0} tin nhắn
                        </p>
                      </div>
                      <Sparkles className={`w-4 h-4 flex-shrink-0 ${
                        currentConversationId === conv.conversationId 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tin nhắn */}
      <div className={`flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-5 transition-all ${showHistory ? 'ml-64 lg:ml-80' : ''}`}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-2xl rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-md ${
              msg.role === 'doctor'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white'
                : msg.isError
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-2 lg:mt-3 ${
                msg.role === 'doctor' ? 'text-white/80' : 'text-gray-400'
              }`}>
                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-md flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">AI đang phân tích triệu chứng...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-3 lg:p-6">
        <div className="flex gap-2 lg:gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Hỏi AI về chẩn đoán, đơn thuốc, hướng dẫn bệnh nhân..."
            disabled={isLoading}
            className="flex-1 px-3 lg:px-5 py-3 lg:py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xs lg:text-sm placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 text-sm lg:text-base"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4 lg:w-5 lg:h-5" />
            )}
            <span className="hidden sm:inline">{isLoading ? 'Đang gửi...' : 'Gửi'}</span>
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 lg:mt-4">
          AI chỉ mang tính hỗ trợ • Luôn kiểm tra lại trước khi áp dụng
        </p>
      </div>
    </div>
  );
}