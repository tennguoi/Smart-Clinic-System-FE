import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Menu, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const N8N_WEBHOOK_URL = "https://n8n.quanliduan-pms.site/webhook/ai-support";
const API_BASE_URL = "http://localhost:8082/api/v1/tmh-assistant";

export default function AIAssistantPanel({ onApplyTreatmentPlan }) {
  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

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
  const [typingMessageId, setTypingMessageId] = useState(null);
  const [parsedTreatmentPlan, setParsedTreatmentPlan] = useState(null);

  const messagesEndRef = useRef(null);
  const historyRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showHistory && historyRef.current && !historyRef.current.contains(e.target)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showHistory]);

  useEffect(() => {
    if (showHistory) loadConversationHistory();
  }, [showHistory]);

  const getDoctorId = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      return userInfo.userId;
    } catch {
      return null;
    }
  };

  const getAuthToken = () => localStorage.getItem('auth_token');

  const typeWriter = (fullText, messageId) => {
    let index = 0;
    setTypingMessageId(messageId);

    const type = () => {
      if (index < fullText.length) {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, displayedText: fullText.substring(0, index + 1) }
            : m
        ));
        index++;
        setTimeout(type, 12);
      } else {
        setMessages(prev => prev.map(m =>
          m.id === messageId
            ? { ...m, displayedText: fullText, isTyping: false }
            : m
        ));
        setTypingMessageId(null);
        
        // ⭐ Sau khi type xong, parse xem có phác đồ không
        tryParseTreatmentPlan(fullText, messageId);
      }
    };
    type();
  };

  // ⭐ Parse response để tìm phác đồ điều trị
  const tryParseTreatmentPlan = (text, messageId) => {
    try {
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        if (parsed.treatmentNotes || (parsed.drugs && Array.isArray(parsed.drugs))) {
          const validDrugs = parsed.drugs?.filter(d => 
            d.drugName && d.drugName.trim() && 
            d.instructions && d.instructions.trim()
          ) || [];
          
          if (parsed.treatmentNotes || validDrugs.length > 0) {
            setParsedTreatmentPlan({
              messageId,
              treatmentNotes: parsed.treatmentNotes || '',
              drugs: validDrugs
            });
          }
        }
      }
    } catch (e) {
      // Không parse được thì thôi, không hiện nút Apply
      console.log('Không tìm thấy phác đồ trong response');
    }
  };

  const createNewConversationSilently = async () => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    
    if (!doctorId || !token) {
      setError('Vui lòng đăng nhập lại');
      throw new Error('Không có doctorId hoặc token');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/new-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-Id': doctorId,
        },
      });

      if (!res.ok) throw new Error('Backend không tạo được conversation');
      const data = await res.json();
      
      setCurrentSessionId(data.sessionId);
      setCurrentConversationId(data.conversationId);
      setError(null);
      
      return data.sessionId;
    } catch (err) {
      console.error('❌ Lỗi tạo conversation:', err);
      setError('Không tạo được cuộc trò chuyện mới');
      throw err;
    }
  };

  const createNewConversation = async () => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    
    if (!doctorId || !token) {
      setError('Vui lòng đăng nhập lại');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/new-conversation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-Id': doctorId,
        },
      });

      if (!res.ok) throw new Error('Backend không tạo được conversation');
      const data = await res.json();
      
      setCurrentSessionId(data.sessionId);
      setCurrentConversationId(data.conversationId);
      
      setMessages([{
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'Xin chào bác sĩ!\nTôi là AI Trợ Lý Y Tế thông minh.\nBạn cần hỗ trợ chẩn đoán, kê đơn hay giải thích kết quả?',
        timestamp: new Date(),
      }]);

      setShowHistory(false);
      setError(null);
      setParsedTreatmentPlan(null);
    } catch (err) {
      console.error('❌ Lỗi tạo conversation:', err);
      setError('Không tạo được cuộc trò chuyện mới');
    }
  };

  const callN8nDirectly = async (userMessage, sessionId) => {
    if (!sessionId) throw new Error('Không có sessionId để gọi n8n');

    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        chatInput: userMessage
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`n8n lỗi ${res.status}: ${text}`);
    }

    const data = await res.json();
    return (data.output || data.text || data.reply || '').toString().trim();
  };

  const saveMessagesToBackend = async (userMessage, aiResponse, sessionId) => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    
    if (!doctorId || !token || !sessionId) return;

    try {
      await fetch(`${API_BASE_URL}/save-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Doctor-Id': doctorId,
        },
        body: JSON.stringify({
          sessionId: sessionId,
          userMessage: userMessage,
          aiMessage: aiResponse
        }),
      });
    } catch (e) {
      console.warn('⚠️ Lưu lịch sử thất bại', e);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setParsedTreatmentPlan(null); // Reset parsed plan

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'doctor',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    const aiMsgId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: aiMsgId,
      role: 'assistant',
      content: '',
      displayedText: '',
      isTyping: true,
      timestamp: new Date(),
    }]);

    try {
      let sessionToUse = currentSessionId;
      
      if (!sessionToUse) {
        sessionToUse = await createNewConversationSilently();
        if (!sessionToUse) throw new Error('Không thể tạo session mới');
      }

      const aiResponse = await callN8nDirectly(userMessage, sessionToUse);
      if (!aiResponse) throw new Error('AI không trả lời');

      typeWriter(aiResponse, aiMsgId);
      saveMessagesToBackend(userMessage, aiResponse, sessionToUse);

      if (showHistory) {
        setTimeout(() => loadConversationHistory(), 1000);
      }

    } catch (err) {
      console.error('❌ Lỗi gửi tin nhắn:', err);
      
      setMessages(prev => prev.filter(m => m.id !== aiMsgId));
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ ${err.message || 'Không kết nối được với AI'}`,
        timestamp: new Date(),
        isError: true,
      }]);
      
      setError('Lỗi kết nối AI: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversationHistory = async () => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    if (!doctorId || !token) return;

    setLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-Id': doctorId,
        },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setConversationHistory(data || []);
    } catch {
      setError('Không tải được lịch sử');
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (conversationId) => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    if (!doctorId || !token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/conversation/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Doctor-Id': doctorId,
        },
      });
      if (!res.ok) throw new Error();

      const data = await res.json();

      const formatted = data.messages.map(m => ({
        id: m.messageId,
        role: m.sender === 'User' ? 'doctor' : 'assistant',
        content: m.message,
        timestamp: new Date(m.sentAt),
      }));

      setMessages(formatted);
      setCurrentConversationId(conversationId);
      setCurrentSessionId(data.sessionId);
      setShowHistory(false);
      setParsedTreatmentPlan(null);
      
    } catch {
      setError('Không tải được cuộc trò chuyện');
    }
  };

  // ⭐ Áp dụng phác đồ vào form
  const handleApplyTreatmentPlan = () => {
    if (parsedTreatmentPlan && onApplyTreatmentPlan) {
      onApplyTreatmentPlan(parsedTreatmentPlan);
      setParsedTreatmentPlan(null); // Ẩn nút sau khi apply
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
            >
              <Menu className="w-4 h-4 lg:w-5 lg:h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
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

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 font-bold">✕</button>
        </div>
      )}

      {/* Sidebar lịch sử */}
      {showHistory && (
        <div ref={historyRef} className="w-64 lg:w-80 bg-white border-r border-gray-200 absolute inset-y-0 left-0 z-20 shadow-2xl flex flex-col">
          <div className="p-4 lg:p-5 border-b border-gray-200">
            <button
              onClick={createNewConversation}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-70 transition-all shadow-md text-sm"
            >
              <Plus className="w-4 h-4" />
              Cuộc trò chuyện mới
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="mt-2 text-sm text-gray-600">Đang tải...</span>
              </div>
            ) : conversationHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-xs font-medium">Chưa có lịch sử trò chuyện</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversationHistory.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => loadConversation(conv.conversationId)}
                    className={`w-full text-left p-3 rounded-lg transition-all hover:bg-blue-50 border ${
                      currentConversationId === conv.conversationId
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {conv.firstMessage?.substring(0, 40) || 'Cuộc trò chuyện'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.startedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tin nhắn */}
      <div className={`flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 ${showHistory ? 'ml-64 lg:ml-80' : ''}`}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-2xl rounded-2xl px-4 py-3 shadow-md ${
                msg.role === 'doctor'
                  ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white'
                  : msg.isError
                    ? 'bg-red-50 border border-red-200 text-red-700'
                    : 'bg-white border border-gray-200 text-gray-800'
              }`}>
                <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.displayedText !== undefined ? msg.displayedText : msg.content}
                  {typingMessageId === msg.id && (
                    <span className="inline-block w-2 h-5 bg-gray-700 ml-1 animate-pulse" />
                  )}
                </p>
                <p className={`text-xs mt-2 ${msg.role === 'doctor' ? 'text-white/80' : 'text-gray-400'}`}>
                  {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* ⭐ Nút Apply nếu message này có phác đồ */}
            {parsedTreatmentPlan && parsedTreatmentPlan.messageId === msg.id && (
              <div className="flex justify-start mt-2">
                <button
                  onClick={handleApplyTreatmentPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <CheckCircle size={16} />
                  Áp dụng phác đồ này vào form
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-md flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600">AI đang phân tích...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white p-3 lg:p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Hỏi AI về chẩn đoán, đơn thuốc, hướng dẫn bệnh nhân..."
            disabled={isLoading}
            className="flex-1 px-3 py-3 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xs placeholder-gray-500 disabled:bg-gray-100 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2 text-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">{isLoading ? 'Đang gửi...' : 'Gửi'}</span>
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3">
          AI chỉ mang tính hỗ trợ • Luôn kiểm tra lại trước khi áp dụng
        </p>
      </div>
    </div>
  );
}