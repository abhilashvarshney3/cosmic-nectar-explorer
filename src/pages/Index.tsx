
import { useState } from 'react';
import BirthDetailsForm from '@/components/BirthDetailsForm';
import ChatInterface from '@/components/ChatInterface';
import { BirthDetails } from '@/lib/types';
import { Toaster } from '@/components/ui/toaster';

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
  
  const handleBackFromChat = () => {
    setShowChat(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-4 overflow-y-auto">
      <header className="w-full max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-cinzel text-vedic-navy mb-2">
          Vedic Astrology Guide
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Discover the ancient wisdom of Vedic astrology through personalized insights based on your birth details.
        </p>
      </header>
      
      <main className="w-full max-w-4xl mx-auto flex-1 perspective-1000 relative">
        {/* Form side */}
        <div className={`transition-transform duration-600 ease-out ${
          showChat ? 'hidden' : 'block'
        }`}>
          <BirthDetailsForm onSubmit={handleFormSubmit} />
        </div>
        
        {/* Chat side */}
        {birthDetails && (
          <div className={`${showChat ? 'block' : 'hidden'}`}>
            <ChatInterface 
              birthDetails={birthDetails} 
              onBackClick={handleBackFromChat}
            />
          </div>
        )}
      </main>
      
      <footer className="w-full max-w-4xl mx-auto mt-8 text-center text-sm text-gray-500">
        <p>Powered by Vedic wisdom and modern technology</p>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
