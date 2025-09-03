import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, X, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { AIService } from "@/lib/ai-service";
import type { AIProvider } from "@/types";

interface AIProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIProviderModal({ isOpen, onClose }: AIProviderModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openai' | 'gemini' | 'grok'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setApiKey(activeProvider.apiKey);
    }
  }, [activeProvider]);

  const saveProviderMutation = useMutation({
    mutationFn: async (data: { provider: string; apiKey: string; isActive: boolean }) => {
      // Check if provider already exists
      const existingProvider = providers.find(p => p.provider === data.provider);
      
      if (existingProvider) {
        return await AIService.updateProvider(existingProvider.id, {
          apiKey: data.apiKey,
          isActive: data.isActive
        });
      } else {
        return await AIService.saveProvider({
          provider: data.provider as any,
          apiKey: data.apiKey,
          isActive: data.isActive
        });
      }
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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save AI provider configuration",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const isConnected = await AIService.testConnection(selectedProvider, apiKey);
      
      if (isConnected) {
        toast({
          title: "Success",
          description: "Connection test successful",
        });
      } else {
        toast({
          title: "Error",
          description: "Connection test failed. Please check your API key.",
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

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    saveProviderMutation.mutate({
      provider: selectedProvider,
      apiKey: apiKey.trim(),
      isActive: true
    });
  };

  const handleClose = () => {
    setApiKey('');
    setShowPassword(false);
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
            <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
              <SelectTrigger className="w-full bg-vc-dark border-vc-border text-vc-text focus:border-vc-primary" data-testid="select-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-vc-card border-vc-border">
                <SelectItem value="openai" className="text-vc-text">OpenAI GPT-4</SelectItem>
                <SelectItem value="gemini" className="text-vc-text">Google Gemini 2.5 Pro</SelectItem>
                <SelectItem value="grok" className="text-vc-text">xAI Grok 4</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* API Key Input */}
          <div>
            <Label className="text-sm font-medium text-vc-text mb-2">API Key</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-vc-dark border-vc-border pr-10 text-vc-text focus:border-vc-primary"
                data-testid="input-api-key"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-vc-text-muted hover:text-vc-text h-8 w-8"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-vc-text-muted mt-1">
              Your API key is stored locally and never shared
            </p>
          </div>

          {/* Test Connection */}
          <Button
            variant="outline"
            className="w-full bg-vc-primary/20 border-vc-primary text-vc-primary hover:bg-vc-primary/30 transition-colors"
            onClick={handleTestConnection}
            disabled={isTestingConnection || !apiKey.trim()}
            data-testid="button-test-connection"
          >
            <Link className="mr-2 h-4 w-4" />
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button
            variant="outline"
            className="flex-1 bg-vc-border text-vc-text hover:bg-vc-border/80 transition-colors"
            onClick={handleClose}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            className="flex-1 bg-vc-primary hover:bg-vc-primary/80 text-white transition-colors shadow-neon"
            onClick={handleSave}
            disabled={saveProviderMutation.isPending || !apiKey.trim()}
            data-testid="button-save-configuration"
          >
            {saveProviderMutation.isPending ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
