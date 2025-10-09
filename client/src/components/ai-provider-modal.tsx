import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/lib/ai-service";

interface AIProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIProviderModal({ isOpen, onClose }: AIProviderModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'grok' | 'gpt5'>('openai');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: providers = [] } = useQuery({
    queryKey: ['/api/ai-providers'],
    queryFn: () => AIService.getProviders(),
  });

  const { data: activeProvider } = useQuery({
    queryKey: ['/api/ai-providers/active'],
    queryFn: () => AIService.getActiveProvider(),
  });

  useEffect(() => {
    if (activeProvider) {
      setSelectedProvider(activeProvider.provider);
      // Don't set the API key since it's from environment
    }
  }, [activeProvider]);

  const saveProviderMutation = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string; isActive: boolean }) => {
      return await AIService.saveProvider({
        provider: data.provider as any,
        apiKey: data.apiKey,
        isActive: data.isActive
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-providers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/ai-providers/active'] });
      toast({
        title: "Success",
        description: "AI provider configuration saved successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Save provider error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save AI provider configuration",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      // Test with environment API key (no key needed from user)
      const isConnected = await AIService.testConnection(selectedProvider, '');
      
      if (isConnected) {
        toast({
          title: "Success",
          description: "Connection test successful",
        });
      } else {
        toast({
          title: "Error",
          description: "Connection test failed. Please check your environment configuration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Connection test failed",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    try {
      await saveProviderMutation.mutateAsync({
        provider: selectedProvider,
        apiKey: '',
        isActive: true
      });
    } catch (error) {
      // Error is handled by mutation's onError
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-vc-card border-vc-border max-w-md text-vc-text" data-testid="modal-ai-provider">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-vc-text">
              AI Provider Configuration
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-vc-text-muted hover:text-vc-text"
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Provider Selection */}
          <div>
            <Label className="text-sm font-medium text-vc-text mb-2">AI Provider</Label>
            <Select 
              value={selectedProvider} 
              onChange={(e) => setSelectedProvider(e.target.value as 'openai' | 'gemini' | 'grok' | 'gpt5')}
              className="w-full bg-vc-dark border-vc-border text-vc-text focus:border-vc-primary" 
              data-testid="select-provider"
            >
              {providers.some(p => p.provider === 'gemini') && (
                <SelectItem value="gemini">Google Gemini 2.5 Pro</SelectItem>
              )}
              {providers.some(p => p.provider === 'openai') && (
                <SelectItem value="openai">OpenAI GPT-4</SelectItem>
              )}
              {providers.some(p => p.provider === 'gpt5') && (
                <SelectItem value="gpt5">OpenAI GPT-5 Preview</SelectItem>
              )}
              {providers.some(p => p.provider === 'grok') && (
                <SelectItem value="grok">xAI Grok 4 Fast Reasoning</SelectItem>
              )}
            </Select>
            <p className="text-xs text-vc-text-muted mt-1">
              Configured via environment variables
            </p>
          </div>

          {/* Test Connection */}
          <Button
            variant="outline"
            className="w-full bg-vc-primary/20 border-vc-primary text-vc-primary hover:bg-vc-primary/30 transition-colors"
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            data-testid="button-test-connection"
          >
            <Link className="mr-2 h-4 w-4" />
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-vc-primary hover:bg-vc-primary/80 text-white transition-colors shadow-neon"
            onClick={handleSave}
            disabled={saveProviderMutation.isPending}
            data-testid="button-save"
          >
            {saveProviderMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
