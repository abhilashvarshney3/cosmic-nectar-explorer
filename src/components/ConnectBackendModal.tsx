
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
  const [huggingFaceToken, setHuggingFaceToken] = useState(API_KEYS.HUGGINGFACE_API_TOKEN);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const availableApis = getAvailableApis();

  useEffect(() => {
    // Update state when the modal opens
    if (isOpen) {
      setProkeralaClientId(API_KEYS.PROKERALA_CLIENT_ID);
      setProkeralaClientSecret(API_KEYS.PROKERALA_CLIENT_SECRET);
      setHuggingFaceToken(API_KEYS.HUGGINGFACE_API_TOKEN);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Save API keys to localStorage
      if (prokeralaClientId) saveApiKey('PROKERALA_CLIENT_ID', prokeralaClientId);
      if (prokeralaClientSecret) saveApiKey('PROKERALA_CLIENT_SECRET', prokeralaClientSecret);
      if (huggingFaceToken) saveApiKey('HUGGINGFACE_API_TOKEN', huggingFaceToken);
      
      // Check if Prokerala API keys are provided
      if (hasAnyApiKey()) {
        toast({
          title: "API Keys Saved",
          description: "Your API keys have been saved for astrology calculations and AI responses."
        });
        onConnect('');
        onClose();
      } else {
        toast({
          title: "No API Keys Provided",
          description: "Please provide API keys to use the service.",
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
            Configure API keys for birth chart calculation and AI responses.
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
          
          <div className="space-y-2 mt-6">
            <h3 className="text-sm font-medium">AI Model Configuration</h3>
            <div className="space-y-2">
              <Label htmlFor="huggingFaceToken">
                Hugging Face API Token (Optional)
              </Label>
              <Input
                id="huggingFaceToken"
                type="password"
                value={huggingFaceToken}
                onChange={(e) => setHuggingFaceToken(e.target.value)}
                placeholder="Enter Hugging Face API token (optional)"
              />
              <p className="text-xs text-gray-500">
                A token is not required but will increase your rate limits. You can get a free API token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Hugging Face</a>.
              </p>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">
            Your Prokerala API credentials are pre-configured, but adding a Hugging Face token will provide better AI responses.
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
