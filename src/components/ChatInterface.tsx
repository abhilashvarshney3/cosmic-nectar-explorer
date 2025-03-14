
import { useState, useRef, useEffect } from 'react';
import { Message, BirthDetails, BirthChart as BirthChartType } from '@/lib/types';
import { sendMessage, generateBirthChart } from '@/lib/astrologyService';
import MessageBubble from './MessageBubble';
import BirthChart from './BirthChart';
import { ArrowUp, Mic, RotateCcw, ArrowLeft, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ChatInterfaceProps {
  birthDetails: BirthDetails;
  onBackClick: () => void;
}

const ChatInterface = ({ birthDetails, onBackClick }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [birthChart, setBirthChart] = useState<BirthChartType | null>(null);
  const [showBirthChart, setShowBirthChart] = useState(true);
  const [isError, setIsError] = useState(false);
  const [apiSource, setApiSource] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Keep track of the last used birth details to prevent redundant regeneration
  const birthDetailsRef = useRef<string>('');
  
  // Generate birth chart and initial greeting message whenever birth details change
  useEffect(() => {
    const birthDetailsString = JSON.stringify(birthDetails);
    
    // Only regenerate if birth details have changed
    if (birthDetailsString !== birthDetailsRef.current) {
      birthDetailsRef.current = birthDetailsString;
      
      const loadBirthChartAndGreeting = async () => {
        setIsTyping(true);
        setIsError(false);
        setMessages([]); // Clear messages when birth details change
        setBirthChart(null); // Clear previous birth chart
        
        try {
          console.log('Generating new birth chart with details:', birthDetails);
          // Generate birth chart first
          const chart = await generateBirthChart(birthDetails);
          setBirthChart(chart);
          setApiSource('Vedic Astrology AI');
          
          // Then get initial greeting message
          const response = await sendMessage(
            `Hello, I'm ${birthDetails.name}. Please analyze my birth chart based on Vedic astrology.`, 
            birthDetails,
            chart
          );
          
          // Set API source based on response
          if (response.source) {
            setApiSource(response.source);
          }
          
          setMessages([response]);
        } catch (error) {
          console.error('Failed to initialize chat:', error);
          setIsError(true);
          toast({
            title: "Connection Error",
            description: "Could not connect to the AI agent. Using fallback responses.",
            variant: "destructive",
          });
        } finally {
          setIsTyping(false);
        }
      };
      
      loadBirthChartAndGreeting();
    }
  }, [birthDetails, toast]);
  
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
    setIsError(false);
    
    try {
      // Get AI response
      const aiResponse = await sendMessage(inputValue, birthDetails, birthChart || undefined);
      
      // Update API source if provided
      if (aiResponse.source) {
        setApiSource(aiResponse.source);
      }
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsError(true);
      toast({
        title: "Message Error",
        description: "Could not get a response from the AI agent. Using fallback response.",
        variant: "destructive",
      });
      
      // Add fallback message
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        content: "I'm sorry, I couldn't connect to the astrology analysis service. Please try again later.",
        sender: 'ai',
        timestamp: new Date(),
        source: 'Fallback System'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleBirthChart = () => {
    setShowBirthChart(prev => !prev);
  };

  const retryConnection = async () => {
    // Force regeneration of birth chart regardless of whether birth details changed
    birthDetailsRef.current = '';
    setMessages([]);
    setIsTyping(true);
    setApiSource('');
    setBirthChart(null);
    
    try {
      console.log('Retrying connection with details:', birthDetails);
      const chart = await generateBirthChart(birthDetails);
      setBirthChart(chart);
      const response = await sendMessage(
        `Hello, I'm ${birthDetails.name}. Please analyze my birth chart based on Vedic astrology.`, 
        birthDetails,
        chart
      );
      
      // Update API source if provided
      if (response.source) {
        setApiSource(response.source);
      }
      
      setMessages([response]);
      setIsError(false);
    } catch (error) {
      console.error('Failed to retry connection:', error);
      setIsError(true);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container glass-card h-full flex flex-col">
      <div className="bg-gradient-primary text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={onBackClick}
            className="mr-3 text-white hover:text-amber-200 transition-colors"
            title="Go back to birth details"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-cinzel">Vedic Astrology Consultation</h2>
        </div>
        <div className="flex items-center space-x-2">
          {apiSource && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-xs px-2 py-1 bg-white/10 rounded">
                  <Info size={12} className="mr-1" />
                  <span>AI: {apiSource}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Using {apiSource} for responses</p>
              </TooltipContent>
            </Tooltip>
          )}
          {isError && (
            <button 
              onClick={retryConnection}
              className="text-white hover:text-amber-200 transition-colors text-sm px-2 py-1 rounded border border-white/30 flex items-center"
              title="Retry connection to AI agent"
            >
              <RotateCcw size={14} className="mr-1" />
              Retry
            </button>
          )}
          <button 
            onClick={toggleBirthChart}
            className="text-white hover:text-amber-200 transition-colors text-sm px-3 py-1 rounded border border-white/30"
          >
            {showBirthChart ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>
      </div>
      
      {/* Birth Chart Section */}
      {birthChart && showBirthChart && (
        <div className="p-4 overflow-auto">
          <BirthChart birthChart={birthChart} />
        </div>
      )}
      
      <div className="messages-container flex-1 overflow-y-auto p-4">
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
      
      <div className="message-input mt-auto p-4 border-t border-gray-200">
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
            disabled={isTyping}
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
