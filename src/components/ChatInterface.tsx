
import { useState, useRef, useEffect } from 'react';
import { Message, BirthDetails } from '@/lib/types';
import { sendMessage } from '@/lib/chatService';
import MessageBubble from './MessageBubble';
import { ArrowUp, Mic } from 'lucide-react';

interface ChatInterfaceProps {
  birthDetails: BirthDetails;
}

const ChatInterface = ({ birthDetails }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initial greeting message
  useEffect(() => {
    const initialMessage = async () => {
      setIsTyping(true);
      try {
        const response = await sendMessage(`Hello, I'm ${birthDetails.name}`, birthDetails);
        setMessages([response]);
      } catch (error) {
        console.error('Failed to get initial message:', error);
      } finally {
        setIsTyping(false);
      }
    };
    
    initialMessage();
  }, [birthDetails]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const aiResponse = await sendMessage(inputValue, birthDetails);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container glass-card h-full">
      <div className="bg-gradient-primary text-white px-4 py-3 rounded-t-xl flex items-center">
        <h2 className="text-lg font-cinzel">Vedic Astrology Consultation</h2>
      </div>
      
      <div className="messages-container">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef}></div>
      </div>
      
      <div className="message-input">
        <div className="chat-input">
          <button className="p-2 rounded-full text-gray-500 hover:text-vedic-purple transition-colors">
            <Mic size={18} />
          </button>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about your birth chart..."
            aria-label="Message input"
          />
          
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
