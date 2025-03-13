
import { useState, useEffect } from 'react';
import { Circle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ConnectBackendModal from './ConnectBackendModal';
import { hasAnyApiKey } from '@/lib/apiConfig';
import { useToast } from '@/hooks/use-toast';

const BackendStatus = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const checkConfiguration = () => {
    setIsChecking(true);
    try {
      // Check if there are any API keys configured
      const configured = hasAnyApiKey();
      setIsConfigured(configured);
    } catch (error) {
      console.error('API configuration check error:', error);
      setIsConfigured(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConfiguration();
    
    // Check configuration status periodically
    const interval = setInterval(checkConfiguration, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleConfigSave = () => {
    checkConfiguration();
    
    toast({
      title: "API Configuration Updated",
      description: "Your astrology API settings have been saved.",
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-white shadow-md"
            onClick={() => setModalOpen(true)}
          >
            {isChecking ? (
              <Circle className="h-4 w-4 animate-pulse text-amber-500" />
            ) : isConfigured ? (
              <Circle className="h-4 w-4 text-green-500" fill="currentColor" />
            ) : (
              <Circle className="h-4 w-4 text-red-500" />
            )}
            <Settings className="h-4 w-4 ml-1" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isConfigured ? "API Keys Configured" : "API Keys Not Configured"}</p>
          <p className="text-xs text-gray-500">Click to configure</p>
        </TooltipContent>
      </Tooltip>
      
      <ConnectBackendModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnect={handleConfigSave}
      />
    </div>
  );
};

export default BackendStatus;
