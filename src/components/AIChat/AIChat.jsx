import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, AlertTriangle, WifiOff } from 'lucide-react';
import { ai } from '../../services/api';
import { getOfflineAdvice } from '../../offline/offlineAI';

const QUICK_ACTIONS = [
  "What's the risk in my area?",
  "Evacuation routes near me",
  "What should I do right now?"
];

const AIChat = () => {
  const [messages, setMessages] = useState([
    { id: 'initial', role: 'ai', text: "Hello. I'm the Crisora AI Assistant. How can I help you stay safe today?" }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const cacheAIResponse = (query, response) => {
    try {
      const cache = JSON.parse(localStorage.getItem('ai_response_cache') || '[]');
      cache.push({ query, response, timestamp: Date.now() });
      if (cache.length > 50) cache.shift();
      localStorage.setItem('ai_response_cache', JSON.stringify(cache));
    } catch (e) {
      console.warn("Failed to cache AI response", e);
    }
  };

  const handleSubmit = async (e, textOverride = null) => {
    e?.preventDefault();
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isThinking) return;

    // Add user message to UI
    const userMessage = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, role: 'ai', text: '' }]);

    if (isOffline) {
      // Offline fallback
      const offlineAdvice = getOfflineAdvice(textToSend);
      setIsThinking(false);
      let idx = 0;
      
      const interval = setInterval(() => {
        idx += 2; // Stream simulation speed
        if (idx > offlineAdvice.length) idx = offlineAdvice.length;
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: offlineAdvice.slice(0, idx) } : msg
          )
        );
        
        if (idx === offlineAdvice.length) {
          clearInterval(interval);
          cacheAIResponse(textToSend, offlineAdvice);
        }
      }, 10);
      return;
    }

    // Online real-time streaming
    let accumulatedText = '';
    try {
      await ai.sendMessage(textToSend, (chunk) => {
        setIsThinking(false);
        accumulatedText += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: accumulatedText } : msg
          )
        );
      });
      cacheAIResponse(textToSend, accumulatedText);
    } catch (error) {
      console.error(error);
      setIsThinking(false);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: 'Sorry, I encountered a network error. Please try again or check your connection.' } 
            : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl font-sans relative">
      
      {/* Offline Banner */}
      {isOffline && (
        <div className="bg-yellow-900/70 border-b border-yellow-500/50 p-2 flex justify-center items-center gap-2 text-yellow-400 absolute top-0 left-0 w-full z-10">
          <WifiOff size={16} className="animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest">You are offline — using pre-loaded guidance</span>
        </div>
      )}

      {/* Disclaimer Banner */}
      <div className={`bg-yellow-900/30 border-b border-yellow-700/50 p-3 flex items-start gap-3 ${isOffline ? 'mt-8' : ''}`}>
        <AlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={18} />
        <p className="text-xs text-yellow-500 font-medium leading-relaxed">
          AI advice is a decision support tool. Always follow official orders and verify critical information with local authorities.
        </p>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`
              ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-100'}
              rounded-2xl px-5 py-3 max-w-[85%] md:max-w-md shadow-md text-sm md:text-base leading-relaxed whitespace-pre-wrap
            `}>
              {msg.role === 'ai' && <Bot size={16} className="inline-block mr-2 mb-1 opacity-70" />}
              {msg.text}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-700 rounded-2xl px-5 py-4 max-w-[85%] md:max-w-md shadow-md flex items-center gap-1.5">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input and Quick Actions Area */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleSubmit(null, action)}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-600 shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isOffline ? "Type your emergency (e.g. Flood, Fire)..." : "Type your question..."}
            className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-5 py-3 text-slate-200 focus:outline-none focus:border-blue-500 shadow-inner"
            disabled={isThinking}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isThinking}
            className={`bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-full p-3 transition-colors shadow-lg flex items-center justify-center ${isOffline ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
          >
            <Send size={20} className={isThinking ? "opacity-50" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
