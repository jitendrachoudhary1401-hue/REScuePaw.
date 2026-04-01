
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2, Info } from 'lucide-react';
import { getFirstAidAdvice } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

const ChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set initial message only once or when language changes
    setMessages([{ role: 'bot', text: t('chatWelcome') }]);
  }, [t]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const reply = await getFirstAidAdvice(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: reply || 'I encountered an error. Please try again.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, my services are overloaded. Please seek help immediately.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed right-6 bottom-24 p-4 bg-emerald-600 text-white rounded-full shadow-2xl transition-all z-40 ${isOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
      </button>

      {isOpen && (
        <div className="fixed inset-x-6 bottom-24 top-24 bg-white rounded-3xl shadow-2xl z-50 flex flex-col border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 text-white rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{t('chatTitle')}</h3>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border p-3 rounded-2xl rounded-bl-none flex gap-2 items-center text-xs text-gray-500">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="bg-emerald-50 p-2 rounded-lg flex gap-2 mb-3 border border-emerald-100">
              <Info className="w-4 h-4 text-emerald-500 shrink-0" />
              <p className="text-[10px] text-emerald-700 italic">{t('chatDisclaimer')}</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder={t('chatPlaceholder')}
                className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-3 bg-emerald-600 text-white rounded-xl active:scale-95 disabled:opacity-50 transition-all"
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
