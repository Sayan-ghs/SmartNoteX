import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Send, Sparkles, FileText, Lightbulb, BookOpen, Zap } from 'lucide-react';

interface AIAssistantProps {
  userRole: 'student' | 'faculty' | 'admin' | null;
  onNavigate: (page: any) => void;
  onLogout: () => void;
}

export function AIAssistant({ userRole, onNavigate, onLogout }: AIAssistantProps) {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    {
      role: 'ai',
      content: 'Hello! I\'m your AI learning assistant. I can help you with note summaries, topic explanations, study recommendations, and answering questions. How can I assist you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    { icon: FileText, label: 'Summarize Notes', prompt: 'Can you summarize my recent notes on Machine Learning?' },
    { icon: Lightbulb, label: 'Explain Topic', prompt: 'Explain quantum computing in simple terms' },
    { icon: BookOpen, label: 'Study Plan', prompt: 'Create a study plan for Data Structures exam' },
    { icon: Zap, label: 'Quick Quiz', prompt: 'Give me a quick quiz on algorithms' },
  ];

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: messageText }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Based on your notes, here are the key concepts:\n\n• Supervised learning involves labeled training data\n• Unsupervised learning finds patterns in unlabeled data\n• Neural networks are inspired by biological neurons\n• Model training requires optimization algorithms',
        'Great question! Let me break that down for you in a clear and structured way...',
        'I\'ve analyzed your learning patterns. Here\'s a personalized recommendation...',
        'Here\'s a comprehensive explanation with examples...'
      ];
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: responses[Math.floor(Math.random() * responses.length)]
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    handleSend(prompt);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar userRole={userRole} onLogout={onLogout} />
      
      <div className="flex">
        <Sidebar currentPage="ai-assistant" onNavigate={onNavigate} userRole={userRole} />
        
        <main className="flex-1 flex flex-col h-[calc(100vh-73px)]">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 text-white">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">AI Learning Assistant</h1>
                  <p className="text-indigo-100">Powered by advanced language models</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto">
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-indigo-50 to-violet-50 hover:from-indigo-100 hover:to-violet-100 rounded-xl border border-indigo-100 transition-all"
                    >
                      <Icon className="w-6 h-6 text-indigo-600" />
                      <span className="text-xs font-medium text-gray-900">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'ai' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white mr-3 flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white ml-3 flex-shrink-0 font-semibold">
                      JD
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white mr-3">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="px-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!input.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </motion.button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
