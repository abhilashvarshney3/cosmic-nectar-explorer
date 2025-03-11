
import { useState } from 'react';
import BirthDetailsForm from '@/components/BirthDetailsForm';
import ChatInterface from '@/components/ChatInterface';
import { BirthDetails } from '@/lib/types';

const Index = () => {
  const [birthDetails, setBirthDetails] = useState<BirthDetails | null>(null);
  const [showChat, setShowChat] = useState(false);
  
  const handleFormSubmit = (details: BirthDetails) => {
    setBirthDetails(details);
    // Add a small delay before showing chat for smooth transition
    setTimeout(() => {
      setShowChat(true);
    }, 400);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-4">
      <header className="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-cinzel text-vedic-navy mb-2">
          Vedic Astrology Guide
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Discover the ancient wisdom of Vedic astrology through personalized insights based on your birth details.
        </p>
      </header>
      
      <main className="w-full max-w-4xl mx-auto flex-1 perspective-1000 relative">
        <div className={`transition-transform duration-600 ease-out transform-style-preserve-3d ${
          showChat ? 'rotate-y-180 invisible' : ''
        }`}>
          <BirthDetailsForm onSubmit={handleFormSubmit} />
        </div>
        
        {birthDetails && (
          <div className={`absolute inset-0 transition-transform duration-600 ease-out transform-style-preserve-3d ${
            showChat ? 'animate-card-flip' : 'rotate-y-180 invisible'
          }`}>
            <div className="backface-hidden h-full">
              <ChatInterface birthDetails={birthDetails} />
            </div>
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-4xl mx-auto mt-8 text-center text-sm text-gray-500">
        <p>Powered by Vedic wisdom and modern technology</p>
      </footer>
      
      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default Index;
