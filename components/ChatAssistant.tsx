
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Info, Sparkles, Phone, Trash2, AlertTriangle, Clock, Shield } from 'lucide-react';
import { getFirstAidAdviceStream, ChatMessage } from '../services/gemini';
import { useLanguage } from '../contexts/LanguageContext';

type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'STABLE' | null;

interface DisplayMessage {
  role: 'user' | 'bot';
  text: string;
  time?: string;
  urgency?: UrgencyLevel;
}

/** Detect urgency level from AI response text */
const detectUrgency = (text: string): UrgencyLevel => {
  const upper = text.toUpperCase();
  // Check for explicit urgency markers in the structured response
  if (upper.includes('🔴 CRITICAL') || upper.includes('CRITICAL') && (upper.includes('[URGENCY]') || upper.includes('URGENCY'))) {
    return 'CRITICAL';
  }
  if (upper.includes('🟠 URGENT') || upper.includes('URGENT') && (upper.includes('[URGENCY]') || upper.includes('URGENCY'))) {
    return 'URGENT';
  }
  if (upper.includes('🟢 STABLE') || upper.includes('STABLE') && (upper.includes('[URGENCY]') || upper.includes('URGENCY'))) {
    return 'STABLE';
  }
  // Fallback keyword detection
  if (upper.includes('EMERGENCY') || upper.includes('IMMEDIATELY') || upper.includes('LIFE-THREATENING')) {
    return 'CRITICAL';
  }
  return null;
};

/** Simple markdown renderer for bot messages */
const renderMarkdown = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    // Skip empty lines but add spacing
    if (!trimmed) {
      elements.push(<div key={i} className="h-1.5" />);
      return;
    }

    // Headers (bold section titles like **Section:**)
    if (/^\*\*.*\*\*$/.test(trimmed) || /^\*\*.*:\*\*/.test(trimmed)) {
      const headerText = trimmed.replace(/\*\*/g, '');
      elements.push(
        <p key={i} className="font-extrabold text-gray-900 text-[13px] mt-2 mb-1 flex items-center gap-1.5">
          {headerText}
        </p>
      );
      return;
    }

    // Numbered list items
    if (/^\d+\.\s/.test(trimmed)) {
      const content = trimmed.replace(/^\d+\.\s/, '');
      const num = trimmed.match(/^(\d+)\./)?.[1];
      elements.push(
        <div key={i} className="flex gap-2.5 items-start ml-1 mb-1">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold flex items-center justify-center mt-0.5">{num}</span>
          <span className="text-[12.5px] text-gray-700 leading-relaxed flex-1">{renderInlineMarkdown(content)}</span>
        </div>
      );
      return;
    }

    // Bullet list items
    if (/^[-•]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[-•]\s/, '');
      elements.push(
        <div key={i} className="flex gap-2.5 items-start ml-1 mb-0.5">
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-400 mt-[7px]" />
          <span className="text-[12.5px] text-gray-700 leading-relaxed flex-1">{renderInlineMarkdown(content)}</span>
        </div>
      );
      return;
    }

    // Horizontal rule / section dividers
    if (/^[━─═\-]{3,}/.test(trimmed)) {
      elements.push(<hr key={i} className="border-gray-100 my-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-[12.5px] text-gray-700 leading-relaxed mb-0.5">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  return <>{elements}</>;
};

/** Handle inline markdown: **bold**, *italic* */
const renderInlineMarkdown = (text: string): React.ReactNode => {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      parts.push(<strong key={key++} className="font-bold text-gray-900">{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }
    // No more matches, push remaining
    parts.push(<span key={key++}>{remaining}</span>);
    break;
  }

  return <>{parts}</>;
};

const ChatAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    { emoji: '🚨', label: t('chatQR_bleeding'), query: 'A street dog is bleeding heavily and won\'t stop. What should I do right now?' },
    { emoji: '🚗', label: t('chatQR_hitByVehicle'), query: 'I found a dog that was hit by a vehicle. It\'s lying on the road and can\'t move. Help!' },
    { emoji: '🤢', label: t('chatQR_poisoning'), query: 'A stray cat seems to have eaten something toxic. It\'s vomiting and shaking. What do I do?' },
    { emoji: '🐕', label: t('chatQR_dogBite'), query: 'An aggressive stray dog bit someone. How should I handle the situation safely for both the human and animal?' },
    { emoji: '🌡️', label: t('chatQR_heatStroke'), query: 'A dog is panting excessively, drooling and seems disoriented in the heat. Is this heat stroke? What are the first aid steps?' },
    { emoji: '🍼', label: t('chatQR_newborn'), query: 'I found newborn kittens alone on the street with no mother in sight. They feel cold. What should I do?' },
    { emoji: '💊', label: t('chatQR_notToFeed'), query: 'What common human foods should I NEVER feed to stray dogs or cats? I want to feed strays safely.' },
  ];

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize with welcome message
  useEffect(() => {
    setMessages([{ role: 'bot', text: t('chatWelcome'), time: getTimestamp() }]);
  }, [t]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleClearChat = () => {
    setMessages([{ role: 'bot', text: t('chatWelcome'), time: getTimestamp() }]);
    setConversationHistory([]);
    setShowQuickReplies(true);
  };

  const handleSend = async (text?: string) => {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    setInput('');
    setShowQuickReplies(false);
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: getTimestamp() }]);
    setIsTyping(true);

    // Create a placeholder bot message that will be updated via streaming
    const botMsgIndex = messages.length + 1; // +1 for the user message we just added

    try {
      // Add empty bot message immediately — it will fill via streaming
      setMessages(prev => [...prev, {
        role: 'bot',
        text: '',
        time: getTimestamp(),
        urgency: null
      }]);
      setIsTyping(false); // Hide typing dots — the streaming message replaces it

      const fullReply = await getFirstAidAdviceStream(
        userMsg,
        conversationHistory,
        (_chunk, fullText) => {
          // Update the last bot message in real-time as chunks arrive
          setMessages(prev => {
            const updated = [...prev];
            const lastBotIdx = updated.length - 1;
            if (updated[lastBotIdx]?.role === 'bot') {
              updated[lastBotIdx] = {
                ...updated[lastBotIdx],
                text: fullText,
                urgency: detectUrgency(fullText)
              };
            }
            return updated;
          });
        }
      );

      // Final update with complete text and urgency
      const finalUrgency = detectUrgency(fullReply || '');
      setMessages(prev => {
        const updated = [...prev];
        const lastBotIdx = updated.length - 1;
        if (updated[lastBotIdx]?.role === 'bot') {
          updated[lastBotIdx] = {
            ...updated[lastBotIdx],
            text: fullReply || 'I encountered an error. Please try again.',
            urgency: finalUrgency
          };
        }
        return updated;
      });

      // Update conversation history for next call
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', text: userMsg },
        { role: 'model', text: fullReply || '' }
      ]);

      if (!isOpen) setHasNewMessage(true);
    } catch (e) {
      setIsTyping(false);
      setMessages(prev => {
        // Update the placeholder or add error message
        const updated = [...prev];
        const lastBotIdx = updated.length - 1;
        if (updated[lastBotIdx]?.role === 'bot' && !updated[lastBotIdx].text) {
          updated[lastBotIdx] = {
            role: 'bot',
            text: '**⚠️ Connection Error.** My services are currently overloaded. Please seek veterinary help immediately. Call your nearest animal helpline.',
            time: getTimestamp(),
            urgency: 'CRITICAL'
          };
        } else {
          updated.push({
            role: 'bot',
            text: '**⚠️ Connection Error.** My services are currently overloaded. Please seek veterinary help immediately. Call your nearest animal helpline.',
            time: getTimestamp(),
            urgency: 'CRITICAL'
          });
        }
        return updated;
      });
    }
  };

  /** Urgency banner component */
  const UrgencyBanner = ({ level }: { level: UrgencyLevel }) => {
    if (!level) return null;

    const config = {
      CRITICAL: {
        bg: 'bg-gradient-to-r from-red-500 to-rose-600',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
        text: t('chatUrgencyCritical'),
        pulse: true,
      },
      URGENT: {
        bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
        icon: <Clock className="w-3.5 h-3.5" />,
        text: t('chatUrgencyUrgent'),
        pulse: false,
      },
      STABLE: {
        bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        icon: <Shield className="w-3.5 h-3.5" />,
        text: t('chatUrgencyStable'),
        pulse: false,
      },
    }[level];

    return (
      <div className={`${config.bg} text-white px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 mb-2 shadow-sm ${config.pulse ? 'animate-pulse' : ''}`}>
        {config.icon}
        {config.text}
      </div>
    );
  };

  /** Call vet CTA for critical cases */
  const CallVetCTA = () => (
    <a
      href="tel:1962"
      className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-red-200/50 active:scale-95 transition-all"
    >
      <Phone className="w-4 h-4" />
      {t('chatCallVet')}
    </a>
  );

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => { setIsOpen(true); setHasNewMessage(false); }}
        className={`fixed right-6 bottom-24 md:bottom-8 z-40 transition-all duration-500 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-pulse-ring opacity-30" />
          <div className="relative p-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-full shadow-2xl shadow-emerald-300/40 hover:shadow-emerald-400/50 hover:scale-110 transition-all duration-300 animate-bounce-subtle neon-glow">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          {hasNewMessage && (
            <span className="badge-new">!</span>
          )}
        </div>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-24 md:bottom-6 md:right-6 md:left-auto md:w-[420px] top-20 md:top-auto md:h-[600px] z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 rounded-3xl shadow-2xl shadow-emerald-900/10 border border-gray-200/80">
          {/* Header */}
          <div className="relative">
            <div className="h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />
            <div className="px-5 py-3.5 glass-frosted flex justify-between items-center">
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
                    <Sparkles className="w-3 h-3" /> {t('chatSubtitle')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Clear chat button */}
                {conversationHistory.length > 0 && (
                  <button
                    onClick={handleClearChat}
                    className="p-2 hover:bg-red-50 rounded-xl transition-colors group"
                    title={t('chatClearHistory')}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Conversation context indicator */}
          {conversationHistory.length > 0 && (
            <div className="px-4 py-1.5 bg-emerald-50/80 border-b border-emerald-100/60 flex items-center justify-between">
              <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('chatContextLabel')} ({Math.floor(conversationHistory.length / 2)} {conversationHistory.length <= 2 ? 'exchange' : 'exchanges'})
              </p>
            </div>
          )}

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50/80 to-white" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-bottom`} style={{ animationDelay: '0.05s' }}>
                <div className="flex flex-col gap-1 max-w-[90%]">
                  {/* Urgency banner for bot messages */}
                  {m.role === 'bot' && m.urgency && <UrgencyBanner level={m.urgency} />}

                  <div className={`p-3.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-2xl rounded-br-md shadow-md shadow-emerald-200/30'
                      : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-md shadow-sm'
                  }`}>
                    {m.role === 'bot' ? renderMarkdown(m.text) : m.text}
                  </div>

                  {/* Call vet CTA for critical bot messages */}
                  {m.role === 'bot' && m.urgency === 'CRITICAL' && i === messages.length - 1 && (
                    <CallVetCTA />
                  )}

                  {m.time && (
                    <span className={`text-[9px] font-medium px-1 ${m.role === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                      {m.time}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Quick reply pills — show after welcome or when toggled */}
            {showQuickReplies && messages.length <= 1 && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{t('chatQuickActions')}</p>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(reply.query)}
                      className="px-3 py-2 bg-white border border-gray-100 rounded-2xl text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all active:scale-95 shadow-sm animate-slide-in-bottom flex items-center gap-1.5"
                      style={{ animationDelay: `${0.1 + i * 0.04}s` }}
                    >
                      <span className="text-sm">{reply.emoji}</span>
                      {reply.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start animate-slide-in-bottom">
                <div className="bg-white border border-gray-100 p-3.5 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium">{t('chatAnalyzing')}</span>
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
