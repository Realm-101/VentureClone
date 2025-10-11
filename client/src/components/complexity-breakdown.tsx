import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Code, 
  Database, 
  Server, 
  ChevronDown, 
  ChevronUp, 
  Info,
  AlertCircle
} from "lucide-react";

interface EnhancedComplexityResult {
  score: number; // 1-10
  breakdown: {
    frontend: { score: number; max: number; technologies: string[] };
    backend: { score: number; max: number; technologies: string[] };
    infrastructure: { score: number; max: number; technologies: string[] };
  };
  factors: {
    customCode: boolean;
    frameworkComplexity: 'low' | 'medium' | 'high';
    infrastructureComplexity: 'low' | 'medium' | 'high';
    technologyCount: number;
    licensingComplexity: boolean;
  };
  explanation: string;
}

interface ComplexityBreakdownProps {
  breakdown: EnhancedComplexityResult;
}

const getComplexityColor = (score: number, max: number) => {
  const percentage = (score / max) * 100;
  if (percentage <= 33) return 'text-green-400';
  if (percentage <= 66) return 'text-yellow-400';
  return 'text-red-400';
};

const getComplexityGradient = (score: number, max: number) => {
  const percentage = (score / max) * 100;
  if (percentage <= 33) return 'from-green-500 to-emerald-500';
  if (percentage <= 66) return 'from-yellow-500 to-orange-500';
  return 'from-orange-500 to-red-500';
};

const getOverallColor = (score: number) => {
  if (score <= 3) return 'text-green-400';
  if (score <= 6) return 'text-yellow-400';
  return 'text-red-400';
};

const getOverallLabel = (score: number) => {
  if (score <= 3) return 'Low Complexity';
  if (score <= 6) return 'Medium Complexity';
  return 'High Complexity';
};

const getOverallBadgeColor = (score: number) => {
  if (score <= 3) return 'bg-green-900/50 text-green-300 border-green-500/50';
  if (score <= 6) return 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50';
  return 'bg-red-900/50 text-red-300 border-red-500/50';
};

const getComplexityLevelLabel = (level: 'low' | 'medium' | 'high') => {
  const labels = {
    low: { text: 'Low', color: 'bg-green-900/50 text-green-300 border-green-500/50' },
    medium: { text: 'Medium', color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50' },
    high: { text: 'High', color: 'bg-red-900/50 text-red-300 border-red-500/50' },
  };
  return labels[level];
};

export function ComplexityBreakdown({ breakdown }: ComplexityBreakdownProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Defensive null checking - provide fallback if breakdown data is missing
  if (!breakdown?.breakdown) {
    return (
      <Card className="bg-vc-dark border-vc-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Complexity Breakdown</h3>
              <p className="text-sm text-vc-text-muted">
                Technical difficulty breakdown
              </p>
            </div>
          </div>
          <div className="bg-vc-card border border-vc-border rounded-lg p-4">
            <p className="text-sm text-vc-text-muted text-center">
              Complexity data is not available yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sections = [
    {
      key: 'frontend',
      title: 'Frontend',
      icon: Code,
      data: breakdown.breakdown?.frontend,
      description: 'User interface and client-side complexity',
    },
    {
      key: 'backend',
      title: 'Backend',
      icon: Server,
      data: breakdown.breakdown?.backend,
      description: 'Server-side logic and API complexity',
    },
    {
      key: 'infrastructure',
      title: 'Infrastructure',
      icon: Database,
      data: breakdown.breakdown?.infrastructure,
      description: 'Hosting, deployment, and DevOps complexity',
    },
  ];

  return (
    <Card className="bg-vc-dark border-vc-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Complexity Breakdown</h3>
              <p className="text-sm text-vc-text-muted">
                Technical difficulty breakdown
              </p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-5 w-5 text-vc-text-muted cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold text-xs">Complexity Scoring</p>
                  <ul className="text-xs space-y-1 list-disc list-inside">
                    <li>Frontend: 0-3 points (UI frameworks, state management)</li>
                    <li>Backend: 0-4 points (APIs, databases, business logic)</li>
                    <li>Infrastructure: 0-3 points (hosting, deployment, scaling)</li>
                  </ul>
                  <p className="text-xs mt-2">
                    Lower scores indicate simpler technology stacks that are easier to replicate.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Overall Score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-vc-text">Overall Complexity</h4>
            <Badge className={`${getOverallBadgeColor(breakdown?.score ?? 0)} border`}>
              {getOverallLabel(breakdown?.score ?? 0)}
            </Badge>
          </div>
          
          <div className="bg-vc-card rounded-lg p-4 border border-vc-border">
            <div className="flex items-center justify-center mb-4">
              <div className={`text-5xl font-bold ${getOverallColor(breakdown?.score ?? 0)}`}>
                {breakdown?.score ?? 0}
              </div>
              <div className="text-2xl text-vc-text-muted ml-2">/10</div>
            </div>
            
            <div className="w-full bg-vc-dark rounded-full h-3">
              <div
                className={`h-3 rounded-full bg-gradient-to-r ${
                  (breakdown?.score ?? 0) <= 3 ? 'from-green-500 to-emerald-500' :
                  (breakdown?.score ?? 0) <= 6 ? 'from-yellow-500 to-orange-500' :
                  'from-orange-500 to-red-500'
                } transition-all`}
                style={{ width: `${((breakdown?.score ?? 0) / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Component Breakdown */}
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-vc-text">Component Breakdown</h4>
          
          {sections.map((section) => {
            // Defensive null checking for section data
            if (!section.data) return null;
            
            const Icon = section.icon;
            const isExpanded = expandedSection === section.key;
            const percentage = (section.data.score / section.data.max) * 100;

            return (
              <div
                key={section.key}
                className="bg-vc-card border border-vc-border rounded-lg overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-vc-card/80 transition-colors"
                  onClick={() => toggleSection(section.key)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${getComplexityColor(section.data.score, section.data.max)}`} />
                      <div>
                        <h5 className="text-sm font-medium text-vc-text">{section.title}</h5>
                        <p className="text-xs text-vc-text-muted">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-lg font-bold ${getComplexityColor(section.data.score, section.data.max)}`}>
                        {section.data.score}/{section.data.max}
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-vc-text-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-vc-text-muted" />
                      )}
                    </div>
                  </div>
                  
                  <div className="w-full bg-vc-dark rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${getComplexityGradient(section.data.score, section.data.max)} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {isExpanded && section.data.technologies?.length > 0 && (
                  <div className="px-4 pb-4 border-t border-vc-border pt-4">
                    <h6 className="text-xs font-semibold text-vc-text-muted mb-2">
                      Related Technologies
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {section.data.technologies?.map((tech, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="border-vc-border text-vc-text bg-vc-dark"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contributing Factors */}
        {breakdown.factors && (
          <div className="space-y-3 mb-6">
            <h4 className="text-sm font-semibold text-vc-text">Contributing Factors</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-vc-card border border-vc-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-vc-text-muted">Custom Code</span>
                  <Badge className={breakdown.factors?.customCode ? 
                    'bg-orange-900/50 text-orange-300 border-orange-500/50 border' : 
                    'bg-green-900/50 text-green-300 border-green-500/50 border'
                  }>
                    {breakdown.factors?.customCode ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>

              <div className="bg-vc-card border border-vc-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-vc-text-muted">Tech Count</span>
                  <Badge className="bg-blue-900/50 text-blue-300 border-blue-500/50 border">
                    {breakdown.factors?.technologyCount ?? 0}
                  </Badge>
                </div>
              </div>

              <div className="bg-vc-card border border-vc-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-vc-text-muted">Framework</span>
                  <Badge className={`${getComplexityLevelLabel(breakdown.factors?.frameworkComplexity ?? 'low').color} border`}>
                    {getComplexityLevelLabel(breakdown.factors?.frameworkComplexity ?? 'low').text}
                  </Badge>
                </div>
              </div>

              <div className="bg-vc-card border border-vc-border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-vc-text-muted">Infrastructure</span>
                  <Badge className={`${getComplexityLevelLabel(breakdown.factors?.infrastructureComplexity ?? 'low').color} border`}>
                    {getComplexityLevelLabel(breakdown.factors?.infrastructureComplexity ?? 'low').text}
                  </Badge>
                </div>
              </div>
            </div>

            {breakdown.factors?.licensingComplexity && (
              <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-300">
                    <p className="font-semibold mb-1">Licensing Complexity Detected</p>
                    <p>Some technologies may have commercial licenses or usage restrictions.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Explanation */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-blue-300 font-semibold text-sm mb-2">Analysis Summary</h5>
              <p className="text-sm text-blue-200 leading-relaxed">
                {breakdown?.explanation ?? 'No detailed explanation available for this complexity analysis.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
