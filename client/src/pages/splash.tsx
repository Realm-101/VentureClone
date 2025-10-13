import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function SplashPage() {
  const [, setLocation] = useLocation();

  const handleEnter = () => {
    setLocation("/home");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      
      <div className="relative z-10 text-center space-y-8 px-4 max-w-4xl mx-auto">
        <div className="space-y-4">
          <img 
            src="/images/Headerlogo.png" 
            alt="VentureClone AI" 
            className="h-24 w-auto mx-auto object-contain"
          />
          <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
            VentureClone AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Analyze any online business for clonability potential with AI-powered insights
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            size="lg" 
            onClick={handleEnter}
            className="text-lg px-8 py-6 rounded-full hover:scale-105 transition-transform"
          >
            Enter →
          </Button>
          <p className="text-sm text-muted-foreground">
            Press Enter to start analyzing businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">🎯 Smart Analysis</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered evaluation of technical complexity, market opportunity, and resource requirements
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">⚡ Fast Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get comprehensive business analysis in seconds with multi-stage workflow
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">📊 Detailed Reports</h3>
            <p className="text-sm text-muted-foreground">
              Export analysis as PDF, HTML, or JSON for further review and planning
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
