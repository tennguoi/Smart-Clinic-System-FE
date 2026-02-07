// AIAssistantPanel.jsx
import { useState, useEffect, useRef } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Sparkles, Send, Menu, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

// Giữ nguyên như file bạn upload để tương thích backend [3](https://cmcglobalcompany-my.sharepoint.com/personal/ndcminh_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/AIAssistantPanel.jsx)
const N8N_WEBHOOK_URL = "https://n8n.quanliduan-pms.site/webhook/ai-support";
const API_BASE_URL = "http://localhost:8082/api/v1/tmh-assistant";

export default function AIAssistantPanel({ onApplyTreatmentPlan }) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Media queries từ react-responsive
  const isMobile = useMediaQuery({ query: '(max-width: 1023px)' });
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });

  const [showHistory, setShowHistory] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: t('aiAssistant.welcomeMessage'),
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

  // Các hàm tiện ích đọc từ localStorage - giữ nguyên chữ ký theo file bạn upload [3](https://cmcglobalcompany-my.sharepoint.com/personal/ndcminh_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/AIAssistantPanel.jsx)
  const getDoctorId = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user_info') ?? '{}');
      return userInfo.userId;
    } catch {
      return null;
    }
  };
  const getAuthToken = () => localStorage.getItem('auth_token');

  // Hiệu ứng đánh máy + parse phác đồ
  const typeWriter = (fullText, messageId) => {
    let index = 0;
    setTypingMessageId(messageId);
    const type = () => {
      if (index < fullText.length) {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, displayedText: fullText.substring(0, index + 1) } : m
        ));
        index++;
        setTimeout(type, 12);
      } else {
        setMessages(prev => prev.map(m =>
          m.id === messageId ? { ...m, displayedText: fullText, isTyping: false } : m
        ));
        setTypingMessageId(null);
        tryParseTreatmentPlan(fullText, messageId);
      }
    };
    type();
  };

  const tryParseTreatmentPlan = (text, messageId) => {
    try {
      let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.treatmentNotes && (parsed.drugs && Array.isArray(parsed.drugs))) {
          const validDrugs = parsed.drugs?.filter(d =>
            d.drugName && d.drugName.trim() && d.instructions && d.instructions.trim()
          ) ?? [];
          if (parsed.treatmentNotes || validDrugs.length > 0) {
            setParsedTreatmentPlan({
              messageId,
              treatmentNotes: parsed.treatmentNotes ?? '',
              drugs: validDrugs
            });
          }
        }
      }
    } catch (e) {
      // Không có plan hợp lệ thì bỏ qua
      console.log(t('aiAssistant.noPlanFound'));
    }
  };

  // Tạo conversation (silent) khi cần - giữ nguyên API theo file bạn upload [3](https://cmcglobalcompany-my.sharepoint.com/personal/ndcminh_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/AIAssistantPanel.jsx)
  const createNewConversationSilently = async () => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    if (!doctorId || !token) {
      setError(t('aiAssistant.errorLoginRequired'));
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
      setError(t('aiAssistant.errorCreateConversation'));
      throw err;
    }
  };

  const createNewConversation = async () => {
    const doctorId = getDoctorId();
    const token = getAuthToken();
    if (!doctorId || !token) {
      setError(t('aiAssistant.errorLoginRequired'));
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
        content: t('aiAssistant.welcomeMessage'),
        timestamp: new Date(),
      }]);
      setShowHistory(false);
      setError(null);
      setParsedTreatmentPlan(null);
    } catch (err) {
      console.error('❌ Lỗi tạo conversation:', err);
      setError(t('aiAssistant.errorCreateConversation'));
    }
  };

  // Gọi n8n trực tiếp (giữ nguyên) [3](https://cmcglobalcompany-my.sharepoint.com/personal/ndcminh_cmcglobal_vn/Documents/Microsoft%20Copilot%20Chat%20Files/AIAssistantPanel.jsx)
  const callN8nDirectly = async (userMessage, sessionId) => {
    if (!sessionId) throw new Error(t('aiAssistant.errorNoSession'));
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, chatInput: userMessage }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`n8n lỗi ${res.status}: ${text}`);
    }
    const data = await res.json();
    return (data.output ?? data.text ?? data.reply ?? '').toString().trim();
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
        body: JSON.stringify({ sessionId, userMessage, aiMessage: aiResponse }),
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
    setParsedTreatmentPlan(null);

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
      if (!aiResponse) throw new Error(t('aiAssistant.errorAINoResponse'));
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
        content: `❌ ${err.message ?? t('aiAssistant.errorConnection')}`,
        timestamp: new Date(),
        isError: true,
      }]);
      setError((t('aiAssistant.errorPrefix') ?? 'Lỗi: ') + err.message);
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
      setConversationHistory(data ?? []);
    } catch {
      setError(t('aiAssistant.errorLoadHistory'));
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
      setError(t('aiAssistant.errorLoadConversation'));
    }
  };

  const handleApplyTreatmentPlan = () => {
    if (parsedTreatmentPlan && onApplyTreatmentPlan) {
      onApplyTreatmentPlan(parsedTreatmentPlan);
      setParsedTreatmentPlan(null);
    }
  };

  // ====================== RENDER ======================
  return (
    <div className={`h-full flex flex-col relative ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div
        className={`border-b px-4 ${isDesktop ? 'lg:px-6' : ''} py-4 ${isDesktop ? 'lg:py-5' : ''} shadow-sm flex items-center justify-between ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <div className={`flex items-center gap-2 ${isDesktop ? 'lg:gap-4' : ''}`}>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-2 ${isDesktop ? 'lg:p-2.5' : ''} rounded-xl transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            title={t('aiAssistant.historyToggle')}
          >
            <Menu className={`w-4 h-4 ${isDesktop ? 'lg:w-5 lg:h-5' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
          </button>

          <div className={`flex items-center gap-2 ${isDesktop ? 'lg:gap-4' : ''}`}>
            <div className="relative">
              <div className={`w-10 h-10 ${isDesktop ? 'lg:w-12 lg:h-12' : ''} bg-gradient-to-br from-blue-600 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg`}>
                <Sparkles className={`w-5 h-5 ${isDesktop ? 'lg:w-7 lg:h-7' : ''} text-white`} />
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${isDesktop ? 'lg:w-4 lg:h-4' : ''} bg-green-500 rounded-full border-2 border-white animate-pulse`} />
            </div>
            <div>
              <h3 className={`text-base ${isDesktop ? 'lg:text-lg' : ''} font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                {t('aiAssistant.title')}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-1 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                {isLoading ? t('aiAssistant.statusThinking') : t('aiAssistant.statusReady')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className={`px-4 py-3 flex items-center gap-2 border-b ${
          theme === 'dark' ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
        }`}>
          <AlertCircle className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`} />
          <span className={`text-sm flex-1 ${theme === 'dark' ? 'text-red-200' : 'text-red-700'}`}>{error}</span>
          <button
            onClick={() => setError(null)}
            className={`font-bold ${theme === 'dark' ? 'text-red-300 hover:text-red-200' : 'text-red-600 hover:text-red-800'}`}
            aria-label="Close error"
          >
            ✕
          </button>
        </div>
      )}

      {/* History drawer */}
      {showHistory && (
        <div
          ref={historyRef}
          className={`w-64 ${isDesktop ? 'lg:w-80' : ''} absolute inset-y-0 left-0 z-20 shadow-2xl flex flex-col border-r ${
            theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <div className={`p-4 ${isDesktop ? 'lg:p-5' : ''} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={createNewConversation}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-70 transition-all shadow-md text-sm"
            >
              <Plus className="w-4 h-4" />
              {t('aiAssistant.newConversation')}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mt-2 text-sm`}>
                  {t('aiAssistant.loadingHistory')}
                </span>
              </div>
            ) : conversationHistory.length === 0 ? (
              <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} text-center py-8`}>
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-60" />
                <p className="text-xs font-medium">{t('aiAssistant.noHistory')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversationHistory.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => loadConversation(conv.conversationId)}
                    className={`w-full text-left p-3 rounded-lg transition-all border ${
                      currentConversationId === conv.conversationId
                        ? (theme === 'dark' ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200')
                        : (theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-gray-50 border-gray-200 hover:bg-blue-50')
                    }`}
                  >
                    <p className={`text-xs font-semibold truncate ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                      {conv.firstMessage?.substring(0, 40) ?? t('aiAssistant.conversationTitle')}
                    </p>
                    <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(conv.startedAt).toLocaleDateString('vi-VN')}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-3 ${isDesktop ? 'lg:p-6' : ''} space-y-3 ${showHistory ? `ml-64 ${isDesktop ? 'lg:ml-80' : ''}` : ''}`}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === 'doctor' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs ${isDesktop ? 'lg:max-w-2xl' : ''} rounded-2xl px-4 py-3 shadow-md ${
                  msg.role === 'doctor'
                    ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white'
                    : msg.isError
                      ? (theme === 'dark' ? 'bg-red-900/20 border border-red-800 text-red-200' : 'bg-red-50 border border-red-200 text-red-700')
                      : (theme === 'dark' ? 'bg-gray-800 border border-gray-700 text-gray-200' : 'bg-white border border-gray-200 text-gray-800')
                }`}
              >
                <p className={`text-xs ${isDesktop ? 'lg:text-sm' : ''} leading-relaxed whitespace-pre-wrap`}>
                  {msg.displayedText !== undefined ? msg.displayedText : msg.content}
                  {typingMessageId === msg.id && (
                    <span className={`inline-block w-2 h-5 ml-1 animate-pulse ${theme === 'dark' ? 'bg-gray-400' : 'bg-gray-700'}`} />
                  )}
                </p>
                <p className={`text-xs mt-2 ${msg.role === 'doctor' ? 'text-white/80' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-400')}`}>
                  {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Nút áp dụng phác đồ nếu message chứa plan đã parse */}
            {parsedTreatmentPlan && parsedTreatmentPlan.messageId === msg.id && (
              <div className="flex justify-start mt-2">
                <button
                  onClick={handleApplyTreatmentPlan}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-lg hover:shadow-lg transition-all"
                >
                  <CheckCircle size={16} />
                  {t('aiAssistant.applyPlan')}
                </button>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className={`rounded-2xl px-4 py-3 shadow-md flex items-center gap-3 border ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>{t('aiAssistant.aiAnalyzing')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={`border-t p-3 ${isDesktop ? 'lg:p-6' : ''} ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={t('aiAssistant.inputPlaceholder')}
            disabled={isLoading}
            className={`flex-1 px-3 py-3 rounded-2xl focus:outline-none focus:ring-4 text-xs transition-all placeholder-gray-500 ${
              theme === 'dark'
                ? 'bg-gray-900 border border-gray-700 text-gray-100 focus:ring-blue-900/50 focus:border-blue-700'
                : 'bg-gray-50 border border-gray-300 focus:ring-blue-100 focus:border-blue-500'
            }`}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2 text-sm"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isLoading ? t('aiAssistant.sending') : t('aiAssistant.sendButton')}
            </span>
          </button>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs text-center mt-3`}>
          {t('aiAssistant.disclaimer')}
        </p>
      </div>
    </div>
  );
}