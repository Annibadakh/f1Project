import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader } from 'lucide-react';
import { useToast } from './Toast';
import chatbotService from '../services/chatbotService';


const ChatBot = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(userMessage);
      setMessages(prev => [...prev, response]);

      if (response.success) {
        addToast({
          type: 'success',
          title: 'Command Executed',
          message: 'Your request was processed successfully'
        });
      }
    } catch (error) {
      const errorMessage = {
        userMessage,
        botResponse: 'Sorry, I encountered an error processing your request. Please try again.',
        success: false,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      addToast({
        type: 'error',
        title: 'Chatbot Error',
        message: error.message || 'Failed to process your request'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickCommands = [
    'Show low stock',
    'Help',
    'Add 10 resistors',
    'Show ESP32'
  ];

  const handleQuickCommand = (command) => {
    setInputMessage(command);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Widget */}
      {isOpen && (
        <div className="mb-4 w-96 h-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-semibold">LIMS Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm">Hi! I'm your LIMS assistant.</p>
                <p className="text-xs mt-1">Try commands like "Show low stock" or "Add 10 resistors"</p>
                
                {/* Quick Commands */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium">Quick commands:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickCommands.map((command, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickCommand(command)}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        {command}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                {/* User Message */}
                <div className="flex justify-end">
                  <div className="flex items-start space-x-2 max-w-xs">
                    <div className="bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm">
                      {message.userMessage}
                    </div>
                    <User className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-xs">
                    <Bot className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                    <div className={`px-3 py-2 rounded-lg text-sm ${
                      message.success 
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.botResponse}</div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium opacity-75">Suggestions:</p>
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickCommand(suggestion)}
                              className="block text-xs text-left w-full px-2 py-1 bg-white dark:bg-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <Bot className="w-6 h-6 text-indigo-500" />
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your command..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ChatBot;
