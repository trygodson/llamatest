import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Scale, FileText, Zap, Shield, Brain } from 'lucide-react';
import { BASE_URL } from '../utils';
interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

const Home: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'bot',
      content:
        "Hello! I'm your legal AI assistant. I can help you with legal research, document analysis, and case preparation. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const userMessage: Message = {
        id: messages.length + 1,
        type: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentQuestion = message;
      setMessage('');
      setIsLoading(true);

      // Create initial bot message for streaming
      const botMessageId = messages.length + 2;
      const initialBotMessage: Message = {
        id: botMessageId,
        type: 'bot',
        content: '',
        timestamp: new Date().toLocaleTimeString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, initialBotMessage]);

      try {
        const response = await fetch(BASE_URL + '/llama/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: currentQuestion,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          let accumulatedContent = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            accumulatedContent += chunk;

            // Update the bot message with accumulated content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId ? { ...msg, content: accumulatedContent, isStreaming: true } : msg,
              ),
            );
          }

          // Mark streaming as complete
          setMessages((prev) => prev.map((msg) => (msg.id === botMessageId ? { ...msg, isStreaming: false } : msg)));
        }
      } catch (error) {
        console.error('Error calling maylaw API:', error);

        // Update with error message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content:
                    'I apologize, but I encountered an error while processing your request. Please try again later.',
                  isStreaming: false,
                }
              : msg,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl mr-4 shadow-lg">
              <Scale className="h-10 w-10 text-white" />
            </div>
            {/* <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LexAI
            </h1> */}
          </div>

          {/* <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-indigo-100">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">🚀 Your AI-Powered Legal Assistant</h2>
              <p className="text-lg text-gray-600 mb-6">
                ⚡ Lightning-fast legal research • 📄 Smart document analysis • 🎯 Precise case insights
              </p>
            </div>
          </div> */}
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-2xl border border-indigo-100 h-[600px] flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">LexAI Assistant</h3>
                  <p className="text-indigo-100 text-sm">🟢 Online & Ready to Help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 px-3 py-1 rounded-full">
                  <span className="text-white text-xs font-medium">💬 Live Chat</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg flex items-start space-x-3 ${
                    msg.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className="flex-shrink-0">
                    {msg.type === 'bot' ? (
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-full shadow-lg">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-2 rounded-full shadow-lg">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div
                    className={`px-4 py-3 rounded-2xl shadow-lg ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                      {msg.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse rounded" />
                      )}
                    </p>
                    <p className="text-xs opacity-70 mt-2">{msg.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center space-x-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="💭 Ask me anything about legal matters... (e.g., 'Help me review this contract')"
                className="flex-1 resize-none border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-center mt-2 space-x-4 text-xs text-gray-500">
              <span>🔒 Secure & Confidential</span>
              <span>•</span>
              <span>⚡ Powered by Advanced AI</span>
              <span>•</span>
              <span>📚 Legal Database Access</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
            <h3 className="text-xl font-bold mb-2">🎯 Ready for Advanced Features?</h3>
            <p className="mb-4 opacity-90">Upload documents, manage cases, and unlock premium AI capabilities</p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="/login"
                className="border-2 border-white text-white px-6 py-2 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
              >
                Login Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
