import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Loader } from 'lucide-react';
import axios from 'axios';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: "👋 Hi! I'm DocuMind. Upload your documents and ask me anything about them!",
      sources: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/query', { question: userMessage });
      setMessages(prev => [...prev, {
        type: 'bot',
        text: response.data.answer,
        sources: response.data.sources || []
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'bot',
        text: `⚠️ Error: ${error.response?.data?.detail || error.message}`,
        sources: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col bg-white/60 backdrop-blur-md shadow-lg rounded-2xl p-6 h-[600px] border border-gray-100">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 p-2 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.type === 'bot' && <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow"><Bot className="w-4 h-4 text-white" /></div>}
            
            <div className={`max-w-[75%] ${msg.type === 'user' ? 'order-first' : ''}`}>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-800'
              }`}>
                {msg.text}
              </div>

              {msg.sources?.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-500 font-semibold">Sources:</p>
                  {msg.sources.map((s, idx) => (
                    <div key={idx} className="text-xs bg-blue-50 border border-blue-100 rounded-lg p-2 flex gap-2">
                      <FileText className="w-3 h-3 text-blue-500" />
                      <div>
                        <p className="font-semibold text-blue-700">{s.filename}</p>
                        <p className="text-gray-600 mt-1">{s.preview}</p>
                        <p className="text-gray-400 mt-1">Relevance: {(s.relevance_score * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.type === 'user' && <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center shadow"><User className="w-4 h-4 text-white" /></div>}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow">
              <Loader className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-gray-100 rounded-lg p-3 text-gray-600">Thinking...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your documents..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-300 flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
