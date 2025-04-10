import React, { useState, useRef, useEffect } from 'react';
import Button from '../common/Button';
import { FiSend, FiAlertCircle } from 'react-icons/fi';

const MessageInput = ({ onSendMessage, disabled = false, connectionsSelected = true }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled && connectionsSelected) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 150) + 'px';
    }
  }, [message]);

  const getPlaceholder = () => {
    if (disabled) return "Please wait for the current response...";
    if (!connectionsSelected) return "Select a connection to send messages...";
    return "Type your message here...";
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative rounded-xl overflow-hidden shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-300 bg-white">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={1}
            className={`w-full px-4 pt-3 pb-2 focus:outline-none transition-colors resize-none ${
              disabled || !connectionsSelected ? 'bg-gray-50 text-gray-500' : 'bg-white'
            }`}
            disabled={disabled || !connectionsSelected}
            style={{ minHeight: '56px', maxHeight: '150px' }}
          />
          
          <div className="px-3 py-1.5 text-xs text-gray-500 flex justify-between items-center bg-gray-50 border-t border-gray-100">
            <div>
              {!connectionsSelected && (
                <span className="flex items-center text-yellow-600">
                  <FiAlertCircle className="h-3 w-3 mr-1" />
                  No connections selected
                </span>
              )}
            </div>
            <div>
              <span>Press <kbd className="font-sans px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">Shift + Enter</kbd> for new line</span>
            </div>
          </div>
        </div>
        
        <Button
          type="submit"
          disabled={!message.trim() || disabled || !connectionsSelected}
          className={`px-4 py-3.5 h-[56px] rounded-xl shadow-sm flex-shrink-0 ${
            !message.trim() || disabled || !connectionsSelected 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <div className="flex items-center justify-center w-full">
            <span className="hidden sm:inline">Send</span>
            <FiSend className="h-4 w-4 sm:ml-2" />
          </div>
        </Button>
      </form>
    </div>
  );
};

export default MessageInput; 