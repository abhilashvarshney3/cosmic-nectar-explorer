
import { useState, useEffect } from 'react';
import { Circle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import ConnectBackendModal from './ConnectBackendModal';
import { getApiServerUrl } from '@/lib/apiConfig';
import { useToast } from '@/hooks/use-toast';

const BackendStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const serverUrl = getApiServerUrl();
      const response = await fetch(`${serverUrl}/vedic_astrology_project/script/generate-birth-chart`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);
      
      setIsConnected(response?.ok || response?.status === 204);
    } catch (error) {
      console.error('Backend connection check error:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Set up interval to check connection periodically
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const handleServerConnect = (url: string) => {
    // This would typically update the serverUrl in a global state or context
    // For now, we'll just check the connection again
    checkConnection();
    
    toast({
      title: "Server configured",
      description: `Connected to Python backend at ${url}`,
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
            ) : isConnected ? (
              <Circle className="h-4 w-4 text-green-500" fill="currentColor" />
            ) : (
              <Circle className="h-4 w-4 text-red-500" />
            )}
            <Settings className="h-4 w-4 ml-1" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isConnected ? "Backend connected" : "Backend disconnected"}</p>
          <p className="text-xs text-gray-500">Click to configure</p>
        </TooltipContent>
      </Tooltip>
      
      <ConnectBackendModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnect={handleServerConnect}
      />
    </div>
  );
};

export default BackendStatus;
