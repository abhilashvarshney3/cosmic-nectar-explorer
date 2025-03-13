
import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getApiServerUrl } from '@/lib/apiConfig';

interface ConnectBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (url: string) => void;
}

const ConnectBackendModal = ({ isOpen, onClose, onConnect }: ConnectBackendModalProps) => {
  const [serverUrl, setServerUrl] = useState(getApiServerUrl());
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!serverUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid server URL",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    
    try {
      // Test connection to the server
      const response = await fetch(`${serverUrl}/vedic_astrology_project/script/generate-birth-chart`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(() => null);
      
      if (response?.ok || response?.status === 204) {
        toast({
          title: "Connected",
          description: "Successfully connected to the Python backend",
        });
        onConnect(serverUrl);
        onClose();
      } else {
        throw new Error("Failed to connect to server");
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Could not connect to the Python backend. Please check if the server is running and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to Python Backend</DialogTitle>
          <DialogDescription>
            Enter the URL of your Python backend server for Vedic astrology calculations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="serverUrl" className="text-right">
              Server URL
            </Label>
            <Input
              id="serverUrl"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="http://localhost:5000"
              className="col-span-3"
            />
          </div>
          
          <div className="col-span-4">
            <p className="text-xs text-gray-500">
              Make sure your Python backend server is running. You can find setup instructions in the README file.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectBackendModal;
