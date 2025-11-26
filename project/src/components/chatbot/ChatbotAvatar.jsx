// src/components/chatbot/ChatbotAvatar.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, X, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AppointmentChatbotForm from './AppointmentChatbotForm';

function MarkdownRenderer({ children, onLinkClick }) {
  const components = {
    a: ({ node, ...props }) => {
      if (props.href && props.href.includes('/chatbot/appointment')) {
        return (
          <a
            {...props}
            onClick={(e) => {
              e.preventDefault();
              if (onLinkClick) onLinkClick(props.href);
            }}
            className="text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer transition"
          >
            {props.children}
          </a>
        );
      }
      return <a {...props} target="_blank" rel="noopener noreferrer">{props.children}</a>;
    },
  };
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}

function ChatbotWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [sessionId] = useState('user-' + Date.now());
  const [conversationId, setConversationId] = useState(localStorage.getItem('conversation_id') || null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialUrl, setFormInitialUrl] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isFormOpen]);

  useEffect(() => {
    if (conversationId) {
      localStorage.setItem('conversation_id', conversationId);
    }
  }, [conversationId]);

  const handleLinkClick = useCallback((url) => {
    setFormInitialUrl(url);
    setIsFormOpen(true);
  }, []);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setFormInitialUrl('');
  };

  const handleFormSuccess = useCallback((result) => {
    const successMsg = {
      id: Date.now(),
      text: `**Đặt lịch thành công!**\n\n` +
            `**Mã lịch:** \`${result.code}\`\n` +
            `**Họ tên:** ${result.patient_name}\n` +
            `**Thời gian:** ${new Date(result.appointment_time).toLocaleString('vi-VN')}\n` +
            `**SĐT:** ${result.phone}\n\n` +
            `Nhân viên sẽ gọi xác nhận trong 30 phút. Cảm ơn anh/chị!`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, successMsg]);
    handleFormClose();
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const userMessage = { id: Date.now(), text: inputText, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    
    // Reset textarea height
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.height = 'auto';
    }
    
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8082/webhook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          conversationId,
          message: { text: currentInput }
        })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const botText = data.output || 'Xin lỗi, em không hiểu.';
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }
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
    <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slideUp">
      
      <div className="bg-gradient-to-br from-purple-700 via-blue-700 to-cyan-600 text-white p-4 flex items-center justify-between flex-shrink-0 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 rounded-full flex items-center justify-center shadow-lg animate-pulse-slow">
            <svg className="w-7 h-7 text-purple-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM16 16H8V15C8 13.67 10.67 13 12 13C13.33 13 16 13.67 16 15V16Z" fill="currentColor"/>
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-lg">Trợ Lý AI Phòng Khám</h2>
            <p className="text-xs text-cyan-100 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Trực tuyến 24/7
            </p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/30 rounded-full p-2 transition-all hover:rotate-90 duration-300 z-10 hover:scale-110">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        
        <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${isFormOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-messages-container">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                  <Bot className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Xin chào! 👋</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Em có thể giúp anh/chị đặt lịch khám, tư vấn dịch vụ. Hãy chọn câu hỏi hoặc nhắn tin!
                </p>
                
                <div className="w-full max-w-sm space-y-2 mt-2">
                  <button
                    onClick={() => {
                      setInputText('Tôi muốn đặt lịch khám');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border border-purple-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Đặt lịch khám bệnh</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputText('Giá dịch vụ khám là bao nhiêu?');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 border border-cyan-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Bảng giá dịch vụ</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputText('Phòng khám làm việc thời gian nào?');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Giờ làm việc</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputText('Phòng khám ở đâu?');
                      setTimeout(() => handleSend(), 100);
                    }}
                    className="w-full text-left px-4 py-3 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 border border-pink-200 rounded-xl transition-all hover:shadow-md hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700">Địa chỉ phòng khám</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender === 'user' ? 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg' : 'bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 shadow-lg animate-pulse-slow'
                }`}>
                  {message.sender === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                </div>
                <div className={`flex flex-col max-w-[75%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-2xl px-4 py-3 prose prose-sm max-w-none shadow-lg transition-all hover:shadow-xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white rounded-tr-none'
                      : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 rounded-tl-none border-2 border-purple-200'
                  }`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%', lineHeight: '1.6' }}>
                    <MarkdownRenderer onLinkClick={handleLinkClick}>{message.text}</MarkdownRenderer>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center shadow-lg animate-pulse">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl rounded-tl-none px-4 py-3 shadow-lg border-2 border-purple-200">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-white p-3">
            <div className="flex gap-2 items-end">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                rows="1"
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none overflow-y-auto custom-scrollbar"
                style={{ 
                  maxHeight: '72px',
                  minHeight: '40px',
                  lineHeight: '1.5'
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 72) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isTyping}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2.5 rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {isFormOpen && (
          <div className="absolute inset-0 bg-white p-4 overflow-y-auto animate-fadeIn">
            <AppointmentChatbotForm
              onClose={handleFormClose}
              initialUrl={formInitialUrl}
              conversationId={conversationId}
              onSuccess={handleFormSuccess}
            />
          </div>
        )}
      </div>
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
      <button onClick={handleOpen} className="fixed bottom-6 right-6 w-20 h-20 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-full shadow-2xl hover:scale-125 transition-all duration-500 flex items-center justify-center z-50 group animate-float">
        {hasNotification && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-pulse border-3 border-white shadow-lg"></span>}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg className="w-12 h-12 text-white group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.1 6 14 6.9 14 8C14 9.1 13.1 10 12 10C10.9 10 10 9.1 10 8C10 6.9 10.9 6 12 6ZM16 16H8V15C8 13.67 10.67 13 12 13C13.33 13 16 13.67 16 15V16Z" fill="currentColor"/>
            <circle cx="12" cy="8" r="2" fill="#60A5FA"/>
            <path d="M12 11C9.79 11 8 12.79 8 15V16H16V15C16 12.79 14.21 11 12 11Z" fill="#60A5FA"/>
          </svg>
        </div>
        <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping-slow opacity-30"></span>
        <span className="absolute inset-0 rounded-full bg-purple-400 animate-ping-slower opacity-20"></span>
      </button>

      {!isOpen && (
        <div className="fixed bottom-24 right-6 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-nowrap z-40 animate-fadeIn">
          Cần hỗ trợ? Chat với chúng tôi!
          <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
        </div>
      )}

      <ChatbotWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />

      <style>{`
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(30px) scale(0.95); } 
          to { opacity: 1; transform: translateY(0) scale(1); } 
        }
        @keyframes fadeIn { 
          from { opacity: 0; transform: scale(0.9); } 
          to { opacity: 1; transform: scale(1); } 
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @keyframes ping-slower {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-ping-slower { animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-pulse-slow { animation: pulse-slow 2s ease-in-out infinite; }
        .prose a { 
          color: #3b82f6; 
          text-decoration: underline; 
          font-weight: 600;
          transition: all 0.2s;
        }
        .prose a:hover { 
          color: #1d4ed8;
          text-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }
        .chat-messages-container {
          -webkit-overflow-scrolling: touch;
        }
        .chat-messages-container::-webkit-scrollbar {
          width: 8px;
        }
        .chat-messages-container::-webkit-scrollbar-track {
          background: rgba(139, 92, 246, 0.1);
          border-radius: 4px;
        }
        .chat-messages-container::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #3b82f6);
          border-radius: 4px;
        }
        .chat-messages-container::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #7c3aed, #2563eb);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </>
  );
}