
import { useState, useRef, useEffect } from 'react';
import { Message, BirthDetails, BirthChart as BirthChartType } from '@/lib/types';
import { sendMessage, generateBirthChart } from '@/lib/chatService';
import MessageBubble from './MessageBubble';
import BirthChart from './BirthChart';
import { ArrowUp, Mic } from 'lucide-react';

interface ChatInterfaceProps {
  birthDetails: BirthDetails;
}

const ChatInterface = ({ birthDetails }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [birthChart, setBirthChart] = useState<BirthChartType | null>(null);
  const [showBirthChart, setShowBirthChart] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate birth chart and initial greeting message
  useEffect(() => {
    const loadBirthChartAndGreeting = async () => {
      setIsTyping(true);
      try {
        // Generate birth chart first
        const chart = await generateBirthChart(birthDetails);
        setBirthChart(chart);
        
        // Then get initial greeting message
        const response = await sendMessage(
          `Hello, I'm ${birthDetails.name}. Please analyze my birth chart.`, 
          birthDetails,
          chart
        );
        setMessages([response]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
      } finally {
        setIsTyping(false);
      }
    };
    
    loadBirthChartAndGreeting();
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
      const aiResponse = await sendMessage(inputValue, birthDetails, birthChart || undefined);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleBirthChart = () => {
    setShowBirthChart(prev => !prev);
  };

  return (
    <div className="chat-container glass-card h-full flex flex-col">
      <div className="bg-gradient-primary text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
        <h2 className="text-lg font-cinzel">Vedic Astrology Consultation</h2>
        <button 
          onClick={toggleBirthChart}
          className="text-white hover:text-amber-200 transition-colors text-sm px-3 py-1 rounded border border-white/30"
        >
          {showBirthChart ? 'Hide Chart' : 'Show Chart'}
        </button>
      </div>
      
      {/* Birth Chart Section - Removed animation */}
      {birthChart && showBirthChart && (
        <div className="p-4 overflow-auto">
          <BirthChart birthChart={birthChart} />
        </div>
      )}
      
      <div className="messages-container flex-1 overflow-y-auto">
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
      
      <div className="message-input mt-auto">
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
