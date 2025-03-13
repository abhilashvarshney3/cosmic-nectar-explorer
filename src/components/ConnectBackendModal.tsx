
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
import { API_KEYS, saveApiKey, hasAnyApiKey } from '@/lib/apiConfig';

interface ConnectBackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (url: string) => void;
}

const ConnectBackendModal = ({ isOpen, onClose, onConnect }: ConnectBackendModalProps) => {
  const [prokeralaClientId, setProkeralaClientId] = useState(API_KEYS.PROKERALA_CLIENT_ID);
  const [prokeralaClientSecret, setProkeralaClientSecret] = useState(API_KEYS.PROKERALA_CLIENT_SECRET);
  const [vedicUserId, setVedicUserId] = useState(API_KEYS.VEDICRISHIASTRO_USER_ID);
  const [vedicApiKey, setVedicApiKey] = useState(API_KEYS.VEDICRISHIASTRO_API_KEY);
  const [openaiApiKey, setOpenaiApiKey] = useState(API_KEYS.OPENAI_API_KEY);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Update state when the modal opens
    if (isOpen) {
      setProkeralaClientId(API_KEYS.PROKERALA_CLIENT_ID);
      setProkeralaClientSecret(API_KEYS.PROKERALA_CLIENT_SECRET);
      setVedicUserId(API_KEYS.VEDICRISHIASTRO_USER_ID);
      setVedicApiKey(API_KEYS.VEDICRISHIASTRO_API_KEY);
      setOpenaiApiKey(API_KEYS.OPENAI_API_KEY);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      // Save API keys to localStorage
      if (prokeralaClientId) saveApiKey('PROKERALA_CLIENT_ID', prokeralaClientId);
      if (prokeralaClientSecret) saveApiKey('PROKERALA_CLIENT_SECRET', prokeralaClientSecret);
      if (vedicUserId) saveApiKey('VEDICRISHIASTRO_USER_ID', vedicUserId);
      if (vedicApiKey) saveApiKey('VEDICRISHIASTRO_API_KEY', vedicApiKey);
      if (openaiApiKey) saveApiKey('OPENAI_API_KEY', openaiApiKey);
      
      // Check if any API key was provided
      if (hasAnyApiKey()) {
        toast({
          title: "API Keys Saved",
          description: "Your API keys have been saved and will be used for astrology calculations."
        });
        onConnect('');
        onClose();
      } else {
        toast({
          title: "No API Keys Provided",
          description: "Please provide at least one set of API keys to use the service.",
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
          <DialogTitle>Configure Astrology API Keys</DialogTitle>
          <DialogDescription>
            Enter your API keys to use external astrology services. You only need to provide one set of API keys.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="prokerala">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="prokerala">Prokerala</TabsTrigger>
            <TabsTrigger value="vedic">VedicRishiAstro</TabsTrigger>
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
          </TabsList>
          
          <TabsContent value="prokerala" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="prokeralaClientId">Client ID</Label>
              <Input
                id="prokeralaClientId"
                value={prokeralaClientId}
                onChange={(e) => setProkeralaClientId(e.target.value)}
                placeholder="Enter Prokerala Client ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prokeralaClientSecret">Client Secret</Label>
              <Input
                id="prokeralaClientSecret"
                type="password"
                value={prokeralaClientSecret}
                onChange={(e) => setProkeralaClientSecret(e.target.value)}
                placeholder="Enter Prokerala Client Secret"
              />
            </div>
            <p className="text-xs text-gray-500">
              Get your API keys from <a href="https://api.prokerala.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Prokerala Developer Portal</a>
            </p>
          </TabsContent>
          
          <TabsContent value="vedic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="vedicUserId">User ID</Label>
              <Input
                id="vedicUserId"
                value={vedicUserId}
                onChange={(e) => setVedicUserId(e.target.value)}
                placeholder="Enter VedicRishiAstro User ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vedicApiKey">API Key</Label>
              <Input
                id="vedicApiKey"
                type="password"
                value={vedicApiKey}
                onChange={(e) => setVedicApiKey(e.target.value)}
                placeholder="Enter VedicRishiAstro API Key"
              />
            </div>
            <p className="text-xs text-gray-500">
              Get your API keys from <a href="https://www.vedicrishiastro.com/astrology-api/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">VedicRishiAstro</a>
            </p>
          </TabsContent>
          
          <TabsContent value="openai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
              <Input
                id="openaiApiKey"
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="Enter OpenAI API Key"
              />
            </div>
            <p className="text-xs text-gray-500">
              This key will be used for astrological interpretations using OpenAI's GPT models. Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAI</a>
            </p>
          </TabsContent>
        </Tabs>
        
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
