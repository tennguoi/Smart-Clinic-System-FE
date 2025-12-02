import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Menu, Plus } from 'lucide-react';

export default function AIAssistantPanel() {
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Xin chào bác sĩ!\nTôi là AI Trợ Lý Y Tế thông minh.\nBạn cần hỗ trợ chẩn đoán, kê đơn hay giải thích kết quả?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const historyRef = useRef(null);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'doctor',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Đang phân tích thông tin bệnh nhân và triệu chứng bạn cung cấp…\n\nTôi sẽ trả lời trong giây lát.',
        timestamp: new Date()
      }]);
    }, 800);
  };

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

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-4">
            <button
              onClick={() => setShowHistory(prev => !prev)}
              className="p-2 lg:p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
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
                  Đang hoạt động
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar lịch sử */}
      {showHistory && (
        <div
          ref={historyRef}
          className="w-64 lg:w-72 bg-white border-r border-gray-200 absolute inset-y-0 left-0 z-20 shadow-2xl flex flex-col"
        >
          <div className="p-4 lg:p-5 border-b border-gray-200">
            <button className="w-full flex items-center justify-center gap-2 py-3 lg:py-3.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 transition-all shadow-md text-sm lg:text-base">
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              Cuộc trò chuyện mới
            </button>
          </div>
          <div className="flex-1 p-4 lg:p-5 text-center text-gray-400">
            <p className="text-xs lg:text-sm">Chưa có lịch sử trò chuyện</p>
          </div>
        </div>
      )}

      {/* Tin nhắn */}
      <div className={`flex-1 overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-5 ${showHistory ? 'ml-64 lg:ml-72' : ''}`}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-lg rounded-2xl px-4 lg:px-6 py-3 lg:py-4 shadow-md ${msg.role === 'doctor'
              ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white'
              : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              <p className="text-xs lg:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-2 lg:mt-3 ${msg.role === 'doctor' ? 'text-white/80' : 'text-gray-400'}`}>
                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
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
            className="flex-1 px-3 lg:px-5 py-3 lg:py-4 bg-gray-50 border border-gray-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-500 text-xs lg:text-sm placeholder-gray-500"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-4 lg:px-8 py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2 text-sm lg:text-base"
          >
            <Send className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
        <p className="text-xs text-center text-gray-500 mt-3 lg:mt-4">
          AI chỉ mang tính hỗ trợ • Luôn kiểm tra lại trước khi áp dụng
        </p>
      </div>
    </div>
  );
}