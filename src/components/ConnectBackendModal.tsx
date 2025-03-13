
import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { API_KEYS, saveApiKey, hasAnyApiKey, getAvailableApis } from '@/lib/apiConfig';

interface ConnectBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (url: string) => void;
}

const ConnectBackendModal = ({ isOpen, onClose, onConnect }: ConnectBackendModalProps) => {
  const [prokeralaClientId, setProkeralaClientId] = useState(API_KEYS.PROKERALA_CLIENT_ID);
  const [prokeralaClientSecret, setProkeralaClientSecret] = useState(API_KEYS.PROKERALA_CLIENT_SECRET);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const availableApis = getAvailableApis();

  useEffect(() => {
    // Update state when the modal opens
    if (isOpen) {
      setProkeralaClientId(API_KEYS.PROKERALA_CLIENT_ID);
      setProkeralaClientSecret(API_KEYS.PROKERALA_CLIENT_SECRET);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Save API keys to localStorage
      if (prokeralaClientId) saveApiKey('PROKERALA_CLIENT_ID', prokeralaClientId);
      if (prokeralaClientSecret) saveApiKey('PROKERALA_CLIENT_SECRET', prokeralaClientSecret);
      
      // Check if Prokerala API keys are provided
      if (hasAnyApiKey()) {
        toast({
          title: "API Keys Saved",
          description: "Your Prokerala API keys have been saved for free astrology calculations."
        });
        onConnect('');
        onClose();
      } else {
        toast({
          title: "No API Keys Provided",
          description: "Please provide Prokerala API keys to use the service.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving API keys:', error);
      toast({
        title: "Configuration Failed",
        description: "Could not save your API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Astrology API</DialogTitle>
          <DialogDescription>
            The application is already configured with Prokerala API keys. You can edit them if needed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
            <h3 className="text-sm font-medium text-amber-800">Available Free APIs</h3>
            <ul className="mt-2 text-sm text-amber-700 list-disc pl-5">
              {availableApis.map((api, index) => (
                <li key={index}>{api}</li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prokeralaClientId">Prokerala Client ID</Label>
            <Input
              id="prokeralaClientId"
              value={prokeralaClientId}
              onChange={(e) => setProkeralaClientId(e.target.value)}
              placeholder="Enter Prokerala Client ID"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prokeralaClientSecret">Prokerala Client Secret</Label>
            <Input
              id="prokeralaClientSecret"
              type="password"
              value={prokeralaClientSecret}
              onChange={(e) => setProkeralaClientSecret(e.target.value)}
              placeholder="Enter Prokerala Client Secret"
            />
          </div>
          <p className="text-xs text-gray-500">
            Your Prokerala API credentials are pre-configured. You only need to change them if you want to use different credentials.
          </p>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? "Saving..." : "Save Configuration"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectBackendModal;
