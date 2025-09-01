import React, { useState, useRef, useEffect } from 'react';
import { Icons, getIcon, LoadingSpinner } from '../utils/icons';
























const ChatInterface = ({ onSearch, isLoading, messages = [] }) => {
  const [input, setInput] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Debug: 확인용 콘솔 로그
  console.log('ChatInterface rendered with props:', { onSearch: !!onSearch, isLoading, messagesCount: messages.length });

  const suggestions = [
    "3-bed near Massey University",
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input.trim());
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (!isLoading) {
      onSearch(suggestion);
    }
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleHeaderClick = () => {
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  return (
    <div 
      className={`fixed top-5 right-5 transition-all duration-300 ease-in-out ${
        isCollapsed 
          ? 'w-16 h-16' 
          : 'w-96 max-h-[calc(100vh-8rem)]'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div 
          className={`flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl transition-all ${
            isCollapsed ? 'cursor-pointer border-none rounded-2xl' : 'cursor-default border-b border-gray-200'
          }`}
          onClick={handleHeaderClick}
        >
          <div className="hover:scale-110 transition-transform cursor-pointer">
            {getIcon('bot', 'lg', 'white')}
          </div>
          {!isCollapsed && (
            <>
              <div className="font-semibold text-base">AI Assistant</div>
              <button
                onClick={toggleCollapse}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                {getIcon('close', 'sm', 'white')}
              </button>
            </>
          )}
        </div>

        {/* Chat Messages */}
        {!isCollapsed && (
          <div className="max-h-80 overflow-y-auto px-5 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {getIcon('home', 'sm', 'white')}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm p-3 max-w-[70%] text-sm leading-relaxed text-gray-800">
                  Hi! I'm your AI rental assistant. Ask me about properties like "Show me 2-bedroom apartments near Massey University under $600/week"
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={index}>
                {message.type === 'user' ? (
                  <div className="flex items-start gap-3 flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      You
                    </div>
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-sm p-3 max-w-[70%] text-sm leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {getIcon('home', 'sm', 'white')}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm p-3 max-w-[70%] text-sm leading-relaxed text-gray-800">
                      {message.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {getIcon('home', 'sm', 'white')}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-bl-sm p-3 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '-0.32s'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce" style={{animationDelay: '-0.16s'}}></div>
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Container */}
        {!isCollapsed && (
          <div className="px-5 py-4 border-t border-gray-200 bg-white rounded-b-2xl">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about rental properties..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full text-sm outline-none transition-all bg-gray-50 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    getIcon('send', 'sm', 'white')
                  )}
                </button>
              </div>
            </form>
            
            {messages.length === 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isLoading}
                    className="px-3.5 py-2 text-xs border border-gray-200 rounded-full bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;