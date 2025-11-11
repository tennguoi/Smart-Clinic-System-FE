// src/components/chatbot/ChatbotAvatar.jsx (ĐÃ SỬA ĐỔI)
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, X, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// Import Form Component
import AppointmentChatbotForm from './AppointmentChatbotForm'; // Đảm bảo đúng đường dẫn

// --- Component Tùy chỉnh để Render Markdown và Bắt Link ---
function MarkdownRenderer({ children, onLinkClick }) {
  const components = {
    // Tùy chỉnh cách render thẻ <a>
    a: ({ node, ...props }) => {
      // BẮT BUỘC: Kiểm tra nếu href là link đặt lịch của chúng ta
      if (props.href && props.href.includes('/chatbot/appointment')) {
        return (
          <a
            {...props}
            onClick={(e) => {
              e.preventDefault(); // Ngăn chặn hành vi mặc định (mở tab mới/chuyển trang)
              if (onLinkClick) onLinkClick(props.href);
            }}
            // Thêm class để hiển thị nổi bật và báo hiệu có thể click
            className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer transition"
          >
            {props.children}
          </a>
        );
      }
      // Giữ nguyên các link khác
      return <a {...props} target="_blank" rel="noopener noreferrer">{props.children}</a>;
    },
  };

  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
// --------------------------------------------------------


function ChatbotWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState('user-' + Date.now());
  
  // State mới để quản lý Modal Form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialUrl, setFormInitialUrl] = useState(''); // Lưu URL để lấy sessionId

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isFormOpen]);

  // Hàm xử lý mở Form khi link được click
  const handleLinkClick = useCallback((url) => {
    setFormInitialUrl(url);
    setIsFormOpen(true);
  }, []);

  // Hàm xử lý đóng Form và quay lại Chat
  const handleFormClose = () => {
    setIsFormOpen(false);
    setFormInitialUrl('');
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), text: inputText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    try {
      // Đã sửa endpoint thành /webhook-test/chat
      const res = await fetch('https://n8n.quanliduan-pms.site/webhook-test/chat', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: { text: currentInput } })
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json(); 
      const botText = data.output || 'Xin lỗi, em không hiểu.'; 

      const botMessage = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        text: 'Xin lỗi, em đang gặp sự cố. Vui lòng thử lại sau!',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  if (!isOpen) return null;

  return (
    // Container Chatbot chính
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slideUp">
      {/* KHUNG CHAT (Ẩn khi Form đang mở) */}
      <div className={`flex flex-col flex-1 transition-opacity duration-300 ${isFormOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold">Trợ Lý Phòng Khám</h2>
              <p className="text-xs text-blue-100">Trực tuyến</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Xin chào!</h3>
              <p className="text-sm text-gray-600">
                Em có thể giúp anh/chị đặt lịch khám, tư vấn dịch vụ. Hãy nhắn tin để bắt đầu!
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-blue-600' : 'bg-gradient-to-br from-indigo-500 to-purple-600'
              }`}>
                {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={`flex flex-col max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-3 py-2 prose prose-sm max-w-none ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 rounded-tl-none shadow-md'
                }`}>
                  {/* SỬ DỤNG COMPONENT MỚI ĐỂ RENDER MARKDOWN VÀ BẮT CLICK */}
                  <MarkdownRenderer onLinkClick={handleLinkClick}>{message.text}</MarkdownRenderer>
                </div>
                <span className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-white p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isTyping}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FORM ĐẶT LỊCH (Hiển thị đè lên Chat Window) */}
      {isFormOpen && (
        <div className="absolute inset-0 bg-white rounded-2xl p-4 overflow-y-auto animate-fadeIn duration-300">
          <AppointmentChatbotForm 
            onClose={handleFormClose} // Hàm đóng modal
            initialUrl={formInitialUrl} // Truyền link để lấy sessionId
          />
        </div>
      )}
    </div>
  );
}

export default function ChatbotAvatar() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasNotification, setHasNotification] = useState(true);
  
    const handleOpen = () => {
      setIsOpen(true);
      setHasNotification(false);
    };
  
    return (
      <>
        <button onClick={handleOpen} className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-50 group">
          {hasNotification && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>}
          <MessageCircle className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></span>
        </button>
  
        {!isOpen && (
          <div className="fixed bottom-24 right-6 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-40 animate-fadeIn">
            Cần hỗ trợ? Chat với chúng tôi!
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
          </div>
        )}
  
        <ChatbotWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
  
        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
          .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
          .prose a { color: #3b82f6; text-decoration: underline; font-weight: 500; }
          .prose a:hover { color: #1d4ed8; }
        `}</style>
      </>
    );
  }