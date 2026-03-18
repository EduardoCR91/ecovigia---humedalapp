
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { useLanguage } from './LanguageContext';

const Chatbot: React.FC = () => {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    {
      role: 'bot',
      text:
        lang === 'en'
          ? 'Hi! I am EcoBot. What would you like to know about the Techo Wetland today?'
          : '¡Hola! Soy EcoBot. ¿Qué te gustaría saber sobre el Humedal de Techo hoy?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await getGeminiResponse(userText, lang === 'en' ? 'en' : 'es');
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text:
            response ||
            (lang === 'en'
              ? 'I could not get an answer.'
              : 'No pude obtener una respuesta.'),
        },
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text:
            lang === 'en'
              ? 'Error connecting to the digital nature.'
              : 'Error al conectar con la naturaleza digital.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-fadeIn">
      <div className="bg-emerald-600 p-4 text-white shrink-0">
        <h2 className="text-lg font-bold">
          {lang === 'en' ? 'EcoBot Assistant' : 'Asistente EcoBot'}
        </h2>
        <p className="text-xs text-emerald-100">
          {lang === 'en'
            ? 'Powered by Proyección Social Uniagustiniana'
            : 'Impulsado por Proyección Social Uniagustiniana'}
        </p>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-emerald-50'
              } whitespace-pre-wrap leading-relaxed`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-emerald-50 text-emerald-600 text-sm shadow-sm">
              <Loader2 size={16} className="animate-spin" />
              <span>
                {lang === 'en' ? 'EcoBot is thinking...' : 'EcoBot está pensando...'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-emerald-100 flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            lang === 'en' ? 'Ask about flora, fauna...' : 'Pregunta sobre flora, fauna...'
          }
          className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-emerald-600 text-white p-2.5 rounded-full disabled:opacity-50 shadow-md"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
