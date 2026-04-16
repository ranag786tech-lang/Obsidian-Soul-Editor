import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Mic, Send, Sparkles, X } from 'lucide-react';

export const FloatingAI = ({ onSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Welcome message
    if (isOpen && conversation.length === 0) {
      setTimeout(() => {
        setConversation([
          {
            role: 'ai',
            content:
              "✨ I am your Soul Companion. Need help with code, writing, or just a creative spark? I'm here for you.",
          },
        ]);
      }, 500);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;

    setConversation((prev) => [...prev, { role: 'user', content: message }]);

    // AI Response (simulated - can connect to OpenAI API)
    setTimeout(() => {
      let response = '';
      if (message.includes('code') || message.includes('function')) {
        response =
          "I see you're coding! Let me help you with that. Here's a suggestion:\n\n```javascript\n// Your code here\nfunction enhance() {\n  return '✨ Creativity flows!';\n}\n```";
      } else if (message.includes('markdown') || message.includes('format')) {
        response =
          'For beautiful markdown, try using:\n- **Bold** for emphasis\n- *Italic* for subtlety\n- `code` for technical bits\n- [links](url) to connect ideas';
      } else {
        response =
          "Your words have power. What you're creating matters. Keep going — I believe in you! 💫";
      }

      setConversation((prev) => [...prev, { role: 'ai', content: response }]);
      if (onSuggestion) onSuggestion(response);
    }, 1000);

    setMessage('');
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };
      recognition.start();
    } else {
      alert('Voice input is supported in modern browsers. Try Chrome!');
    }
  };

  return (
    <>
      {/* Soul Orb Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] flex items-center justify-center shadow-2xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            '0 0 0 0 rgba(122, 162, 247, 0.4)',
            '0 0 0 20px rgba(122, 162, 247, 0)',
            '0 0 0 0 rgba(122, 162, 247, 0.4)',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bot size={32} className="text-white" />
      </motion.button>

      {/* AI Companion Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-28 right-8 w-96 h-[500px] glass-panel rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-white" />
                <span className="font-semibold text-white">Soul Companion</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:opacity-70">
                <X size={20} />
              </button>
            </div>

            {/* Conversation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversation.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-[#7aa2f7] text-white' : 'bg-gray-800 text-gray-200'}`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#7aa2f7]"
                />
                <button
                  onClick={startVoiceInput}
                  className={`p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  <Mic size={20} />
                </button>
                <button
                  onClick={handleSend}
                  className="bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] p-2 rounded-lg text-white hover:opacity-90"
                >
                  <Send size={20} />
                </button>
              </div>
              {isListening && <p className="text-xs text-center mt-2 text-red-400">🎤 Listening... Speak now</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
