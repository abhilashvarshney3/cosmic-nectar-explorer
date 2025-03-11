
import { Message } from '@/lib/types';
import { format } from 'date-fns';
import PlanetaryChart from './PlanetaryChart';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { content, sender, timestamp, type, planetaryData } = message;
  
  if (sender === 'user') {
    return (
      <div className="flex flex-col items-end mb-4 animate-fade-in">
        <div className="user-message">
          <p className="text-white">{content}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {format(new Date(timestamp), 'h:mm a')}
        </span>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-start mb-4 animate-fade-in">
      <div className={cn(
        "ai-message",
        type === 'remedy' && "border-l-vedic-gold border-l-4"
      )}>
        <div className="flex items-center mb-2">
          <span className="mr-2 text-lg">🕉️</span>
          <h4 className="text-sm font-medium text-vedic-navy">Vedic Guide</h4>
        </div>
        
        <p className="text-gray-700 mb-1">{content}</p>
        
        {type === 'planetary' && planetaryData && (
          <PlanetaryChart planetaryData={planetaryData} />
        )}
        
        {type === 'remedy' && (
          <div className="mt-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
            <div className="flex items-center mb-1">
              <span className="mr-1 text-amber-500">✨</span>
              <span className="text-sm font-medium text-amber-800">Recommended Remedies</span>
            </div>
            <div className="text-sm text-amber-700">
              {content.split(/\d+\)/).slice(1).map((remedy, i) => (
                <div key={i} className="flex items-start mt-1">
                  <span className="mr-1 bg-amber-100 text-amber-700 w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0">{i+1}</span>
                  <span>{remedy.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <span className="text-xs text-gray-500 mt-1">
        {format(new Date(timestamp), 'h:mm a')}
      </span>
    </div>
  );
};

// Helper to merge classes
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

export default MessageBubble;
