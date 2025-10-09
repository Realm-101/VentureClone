import { Bot } from "lucide-react";

interface AIProviderIconProps {
  provider?: string | undefined;
  className?: string;
}

/**
 * Displays the appropriate AI provider icon based on the selected provider
 * Falls back to a robot icon if provider is not recognized
 */
export function AIProviderIcon({ provider, className = "h-5 w-5" }: AIProviderIconProps) {
  const normalizedProvider = provider?.toLowerCase();

  if (normalizedProvider === 'gemini') {
    return (
      <img 
        src="/images/Gemini.svg" 
        alt="Gemini" 
        className={className}
      />
    );
  }

  if (normalizedProvider === 'grok') {
    return (
      <img 
        src="/images/Grok.svg" 
        alt="Grok" 
        className={className}
      />
    );
  }

  // Fallback to robot icon for OpenAI or unknown providers
  return <Bot className={className} />;
}
