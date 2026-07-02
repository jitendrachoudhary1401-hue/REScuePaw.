
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Info, Sparkles } from 'lucide-react';
import { getFirstAidAdvice } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

const ChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string; time?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "🩹 First aid for bleeding",
    "🦴 Broken bone signs",
    "🐕 Dog won't eat",
    "🐈 Cat in shock",
  ];

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    setMessages([{ role: 'bot', text: t('chatWelcome'), time: getTimestamp() }]);
  }, [t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: getTimestamp() }]);
    setIsTyping(true);

    try {
      const reply = await getFirstAidAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: reply || 'I encountered an error. Please try again.', time: getTimestamp() }]);
      if (!isOpen) setHasNewMessage(true);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, my services are overloaded. Please seek help immediately.', time: getTimestamp() }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button with bounce entrance and gradient ring */}
      <button 
        onClick={() => { setIsOpen(true); setHasNewMessage(false); }}
        className={`fixed right-6 bottom-24 md:bottom-8 z-40 transition-all duration-500 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse-ring opacity-30" />
          {/* Main button */}
          <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-300/40 hover:shadow-emerald-400/50 hover:scale-110 transition-all duration-300 animate-bounce-subtle neon-glow">
            <MessageCircle className="w-6 h-6" />
          </div>
          {/* Online dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          {/* New message badge */}
          {hasNewMessage && (
            <span className="badge-new">!</span>
          )}
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 md:bottom-6 md:right-6 md:left-auto md:w-[400px] top-20 md:top-auto md:h-[560px] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-gray-200/80">
          {/* Frosted glass header with gradient accent */}
          <div className="relative">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
            <div className="px-5 py-4 glass-frosted flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200/50">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">{t('chatTitle')}</h3>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI-Powered
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/80 to-white" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-bottom`} style={{ animationDelay: '0.05s' }}>
                <div className="flex flex-col gap-1 max-w-[85%]">
                  <div className={`p-3.5 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-2xl rounded-br-md shadow-md shadow-emerald-200/30' 
                      : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md shadow-sm'
                  }`}>
                    {m.text}
                  </div>
                  {m.time && (
                    <span className={`text-[9px] font-medium px-1 ${m.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                      {m.time}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Quick reply pills — show only after first bot message */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(reply)}
                    className="px-3 py-1.5 bg-white border border-emerald-100 rounded-full text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 shadow-sm animate-slide-in-bottom"
                    style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator with bouncing dots */}
            {isTyping && (
              <div className="flex justify-start animate-slide-in-bottom">
                <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="bg-emerald-50/80 p-2 rounded-xl flex gap-2 mb-3 border border-emerald-100/60">
              <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-emerald-700/80 leading-relaxed">{t('chatDisclaimer')}</p>
            </div>
            <div className="flex gap-2.5">
              <input 
                type="text" 
                placeholder={t('chatPlaceholder')}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 outline-none transition-all font-medium"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl active:scale-95 disabled:opacity-40 disabled:from-gray-300 disabled:to-gray-300 transition-all shadow-lg shadow-emerald-200/40 hover:shadow-emerald-300/50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;
