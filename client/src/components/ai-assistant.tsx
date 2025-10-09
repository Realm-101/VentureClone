import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle, X, Send, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIProviderIcon } from "@/components/ai-provider-icon";
import { AIService } from "@/lib/ai-service";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Knowledge base from documentation
const KNOWLEDGE_BASE = {
  greetings: [
    "Hello! I'm your VentureClone AI assistant. How can I help you analyze businesses today?",
    "Welcome back! Ready to discover your next venture opportunity?",
    "Hi there! I'm here to guide you through the 6-stage cloning process.",
  ],
  
  features: {
    analysis: "You can analyze any website URL to assess its clonability potential. Just paste the URL in the input field and I'll provide a comprehensive analysis with scores across 5 dimensions.",
    workflow: "Our 6-stage workflow guides you from Discovery & Selection through AI Automation Mapping. Each stage has specific deliverables and AI-generated content.",
    comparison: "Compare multiple businesses side-by-side to identify the best opportunities. You can see average scores and find your strongest candidates.",
    export: "Export your analyses in HTML, CSV, or JSON formats. Perfect for sharing with team members or keeping records.",
    batch: "Analyze up to 10 URLs simultaneously with our batch analysis feature. Great for competitive analysis!",
    analytics: "Visit the Analytics page to see comprehensive charts and insights across all your analyses.",
  },
  
  scoring: {
    interpretation: {
      "9-10": "Excellent opportunity - proceed immediately with high confidence",
      "7-8": "Strong candidate - minor challenges but very viable",
      "5-6": "Moderate opportunity - requires significant work but possible",
      "3-4": "Challenging - needs major resources and expertise",
      "0-2": "Not recommended - too difficult or competitive",
    },
    criteria: [
      "Technical Complexity - How difficult is it to build?",
      "Market Opportunity - How large is the addressable market?",
      "Competitive Landscape - How saturated is the market?",
      "Resource Requirements - What capital and skills are needed?",
      "Time to Market - How quickly can you launch?",
    ],
  },
  
  stages: {
    1: "Discovery & Selection - Identify and validate business opportunities",
    2: "Lazy-Entrepreneur Filter - Assess effort vs reward ratio",
    3: "MVP Launch Planning - Define your minimum viable product",
    4: "Demand Testing Strategy - Validate market demand",
    5: "Scaling & Growth - Plan for expansion",
    6: "AI Automation Mapping - Identify automation opportunities",
  },
  
  tips: [
    "Start with businesses you understand or have experience in",
    "Focus on B2B SaaS for recurring revenue potential",
    "Look for businesses with clear monetization models",
    "Validate demand before heavy investment",
    "Automate repetitive processes early",
  ],
};

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: activeProvider } = useQuery({
    queryKey: ['/api/ai-providers/active'],
    queryFn: () => AIService.getActiveProvider(),
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      const greeting = KNOWLEDGE_BASE.greetings[Math.floor(Math.random() * KNOWLEDGE_BASE.greetings.length)];
      setMessages([{
        id: Date.now().toString(),
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Check for feature questions
    if (lowerInput.includes('analyze') || lowerInput.includes('analysis')) {
      return KNOWLEDGE_BASE.features.analysis;
    }
    
    if (lowerInput.includes('workflow') || lowerInput.includes('stage')) {
      const stages = Object.entries(KNOWLEDGE_BASE.stages)
        .map(([num, desc]) => `Stage ${num}: ${desc}`)
        .join('\n');
      return `Our 6-stage workflow:\n${stages}\n\nEach stage builds on the previous one to systematically validate and scale your venture.`;
    }
    
    if (lowerInput.includes('score') || lowerInput.includes('scoring')) {
      const interpretation = Object.entries(KNOWLEDGE_BASE.scoring.interpretation)
        .map(([range, desc]) => `• Score ${range}: ${desc}`)
        .join('\n');
      return `Score interpretation:\n${interpretation}\n\nWe evaluate across 5 criteria:\n${KNOWLEDGE_BASE.scoring.criteria.join('\n')}`;
    }
    
    if (lowerInput.includes('export')) {
      return KNOWLEDGE_BASE.features.export;
    }
    
    if (lowerInput.includes('batch')) {
      return KNOWLEDGE_BASE.features.batch;
    }
    
    if (lowerInput.includes('compare') || lowerInput.includes('comparison')) {
      return KNOWLEDGE_BASE.features.comparison;
    }
    
    if (lowerInput.includes('analytics') || lowerInput.includes('charts')) {
      return KNOWLEDGE_BASE.features.analytics;
    }
    
    if (lowerInput.includes('tip') || lowerInput.includes('advice') || lowerInput.includes('best')) {
      const tip = KNOWLEDGE_BASE.tips[Math.floor(Math.random() * KNOWLEDGE_BASE.tips.length)];
      return `Here's a pro tip: ${tip}`;
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('how')) {
      return "I can help you with:\n• Analyzing URLs for clonability\n• Understanding the 6-stage workflow\n• Interpreting scores and metrics\n• Comparing multiple businesses\n• Exporting your data\n• Using batch analysis\n• Navigating analytics\n\nWhat would you like to know more about?";
    }
    
    // Default response
    return "I can help you analyze businesses, understand our scoring system, navigate the 6-stage workflow, and make the most of VentureClone AI. What specific aspect would you like to explore?";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="relative h-14 w-14 rounded-full bg-gradient-to-r from-vc-primary to-vc-secondary shadow-2xl hover:shadow-vc-primary/50 transition-all duration-300"
          data-testid="button-ai-assistant"
        >
          {isOpen ? (
            <X className="h-6 w-6 text-white" />
          ) : (
            <MessageCircle className="h-6 w-6 text-white" />
          )}
          
          {/* Pulse animation when closed */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vc-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-vc-accent"></span>
            </span>
          )}
        </Button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] max-h-[80vh]">
          <Card className="h-full bg-vc-card/95 backdrop-blur-xl border-vc-border shadow-2xl overflow-hidden">
            {/* Simple Avatar Header */}
            <div className="relative h-32 bg-gradient-to-br from-vc-primary/20 via-vc-secondary/20 to-vc-accent/20 border-b border-vc-border">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-vc-primary/20 to-transparent animate-pulse" />
              </div>
              
              {/* Simple Avatar */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-vc-primary to-vc-secondary opacity-60" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-vc-accent to-vc-primary opacity-80" />
                  <div className="absolute inset-3 rounded-full bg-vc-dark flex items-center justify-center">
                    <AIProviderIcon 
                      provider={activeProvider?.provider} 
                      className="h-8 w-8 text-vc-accent"
                    />
                  </div>
                </div>
              </div>
                
                <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-vc-accent" />
                    <span className="text-sm font-semibold text-vc-text">VentureClone Assistant</span>
                  </div>
                  <Badge className="bg-green-900/50 text-green-300 text-xs">
                    <Zap className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                </div>
              </div>

            {/* Messages */}
            <div className="flex-1 h-[calc(100%-12rem)] p-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-vc-primary to-vc-secondary text-white'
                          : 'bg-vc-dark border border-vc-border text-vc-text'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-vc-dark border border-vc-border rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-vc-primary rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-vc-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-vc-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

              {/* Input */}
              <div className="p-4 border-t border-vc-border">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about VentureClone..."
                    className="flex-1 bg-vc-dark border-vc-border text-vc-text placeholder:text-vc-text-muted"
                    disabled={isTyping}
                    data-testid="input-assistant-message"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-gradient-to-r from-vc-primary to-vc-secondary hover:opacity-90"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
          </Card>
        </div>
      )}
    </>
  );
}