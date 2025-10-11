import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  GraduationCap, 
  Code, 
  Server, 
  Database, 
  Palette,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Star,
  Info
} from "lucide-react";

interface LearningResource {
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'course' | 'video';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SkillRequirement {
  skill: string;
  category: 'frontend' | 'backend' | 'infrastructure' | 'design';
  proficiency: 'beginner' | 'intermediate' | 'advanced';
  priority: 'critical' | 'important' | 'nice-to-have';
  learningResources: LearningResource[];
  relatedTechnologies: string[];
}

interface SkillRequirementsSectionProps {
  skills: SkillRequirement[];
}

const getCategoryConfig = (category: SkillRequirement['category']) => {
  const configs = {
    frontend: {
      icon: Code,
      color: 'bg-blue-900/50 text-blue-300 border-blue-500/50',
      iconColor: 'text-blue-400',
      label: 'Frontend',
    },
    backend: {
      icon: Server,
      color: 'bg-green-900/50 text-green-300 border-green-500/50',
      iconColor: 'text-green-400',
      label: 'Backend',
    },
    infrastructure: {
      icon: Database,
      color: 'bg-purple-900/50 text-purple-300 border-purple-500/50',
      iconColor: 'text-purple-400',
      label: 'Infrastructure',
    },
    design: {
      icon: Palette,
      color: 'bg-pink-900/50 text-pink-300 border-pink-500/50',
      iconColor: 'text-pink-400',
      label: 'Design',
    },
  };
  return configs[category];
};

const getProficiencyConfig = (proficiency: SkillRequirement['proficiency']) => {
  const configs = {
    beginner: {
      color: 'bg-green-900/50 text-green-300 border-green-500/50',
      label: 'Beginner',
    },
    intermediate: {
      color: 'bg-yellow-900/50 text-yellow-300 border-yellow-500/50',
      label: 'Intermediate',
    },
    advanced: {
      color: 'bg-red-900/50 text-red-300 border-red-500/50',
      label: 'Advanced',
    },
  };
  return configs[proficiency];
};

const getPriorityConfig = (priority: SkillRequirement['priority']) => {
  const configs = {
    critical: {
      color: 'bg-red-900/50 text-red-300 border-red-500/50',
      label: 'Critical',
      icon: Star,
    },
    important: {
      color: 'bg-orange-900/50 text-orange-300 border-orange-500/50',
      label: 'Important',
      icon: Star,
    },
    'nice-to-have': {
      color: 'bg-gray-900/50 text-gray-300 border-gray-500/50',
      label: 'Nice to Have',
      icon: Star,
    },
  };
  return configs[priority];
};

const getResourceTypeIcon = (type: LearningResource['type']) => {
  // Return a simple text label instead of an icon for resource types
  const labels = {
    documentation: '📚',
    tutorial: '📝',
    course: '🎓',
    video: '🎥',
  };
  return labels[type];
};

export function SkillRequirementsSection({ skills }: SkillRequirementsSectionProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setExpandedSkill(expandedSkill === skill ? null : skill);
  };

  // Add null check for skills array
  if (!skills || skills.length === 0) {
    return (
      <Card className="bg-vc-dark border-vc-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-vc-text">Skill Requirements</h3>
                <p className="text-sm text-vc-text-muted">
                  Technical expertise needed for cloning
                </p>
              </div>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-vc-text-muted">No skill requirements available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    const group = acc[skill.category];
    if (group) {
      group.push(skill);
    }
    return acc;
  }, {} as Record<string, SkillRequirement[]>);

  // Sort categories by importance
  const categoryOrder: SkillRequirement['category'][] = ['frontend', 'backend', 'infrastructure', 'design'];
  const sortedCategories = categoryOrder.filter(cat => groupedSkills[cat]);

  return (
    <Card className="bg-vc-dark border-vc-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-vc-text">Skill Requirements</h3>
              <p className="text-sm text-vc-text-muted">
                Technical expertise needed for cloning
              </p>
            </div>
          </div>
          <Badge className="bg-vc-accent/20 text-vc-accent border-vc-accent/50">
            {skills.length} {skills.length === 1 ? 'skill' : 'skills'}
          </Badge>
        </div>

        <div className="space-y-6">
          {sortedCategories.map((category) => {
            const categoryConfig = getCategoryConfig(category);
            const categorySkills = groupedSkills[category];
            
            if (!categoryConfig || !categorySkills) return null;
            
            const CategoryIcon = categoryConfig.icon;

            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`h-5 w-5 ${categoryConfig.iconColor}`} />
                  <h4 className="text-sm font-semibold text-vc-text">{categoryConfig.label}</h4>
                  <Badge className={`${categoryConfig.color} text-xs border`}>
                    {categorySkills.length}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {categorySkills.map((skill) => {
                    const isExpanded = expandedSkill === skill.skill;
                    const proficiencyConfig = getProficiencyConfig(skill.proficiency);
                    const priorityConfig = getPriorityConfig(skill.priority);
                    const PriorityIcon = priorityConfig.icon;

                    return (
                      <div
                        key={skill.skill}
                        className="bg-vc-card border border-vc-border rounded-lg overflow-hidden hover:border-vc-primary transition-colors"
                      >
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleSkill(skill.skill)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="text-sm font-medium text-vc-text">
                                  {skill.skill}
                                </h5>
                                {skill.priority === 'critical' && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <PriorityIcon className="h-4 w-4 text-red-400 fill-red-400" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="text-xs">Critical skill for MVP</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                              {skill.relatedTechnologies?.length > 0 && !isExpanded && (
                                <div className="flex flex-wrap gap-1">
                                  {skill.relatedTechnologies.slice(0, 3).map((tech, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="text-xs border-vc-border text-vc-text-muted"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                  {skill.relatedTechnologies.length > 3 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs border-vc-border text-vc-text-muted"
                                    >
                                      +{skill.relatedTechnologies.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${proficiencyConfig.color} text-xs border whitespace-nowrap`}>
                                {proficiencyConfig.label}
                              </Badge>
                              <Badge className={`${priorityConfig.color} text-xs border whitespace-nowrap`}>
                                {priorityConfig.label}
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-vc-text-muted flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-vc-text-muted flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-vc-border pt-4 space-y-4">
                            {/* Related Technologies */}
                            {skill.relatedTechnologies?.length > 0 && (
                              <div>
                                <h6 className="text-xs font-semibold text-vc-text-muted mb-2">
                                  Related Technologies
                                </h6>
                                <div className="flex flex-wrap gap-2">
                                  {skill.relatedTechnologies.map((tech, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="border-vc-border text-vc-text bg-vc-dark"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Learning Resources */}
                            {skill.learningResources?.length > 0 && (
                              <div>
                                <h6 className="text-xs font-semibold text-vc-text-muted mb-2">
                                  Learning Resources
                                </h6>
                                <div className="space-y-2">
                                  {skill.learningResources.map((resource, i) => (
                                    <a
                                      key={i}
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-start gap-3 p-3 bg-vc-dark rounded-lg border border-vc-border hover:border-vc-primary transition-colors group"
                                    >
                                      <span className="text-lg">{getResourceTypeIcon(resource.type)}</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="text-sm text-vc-text font-medium group-hover:text-vc-primary transition-colors truncate">
                                            {resource.title}
                                          </span>
                                          <ExternalLink className="h-3 w-3 text-vc-text-muted group-hover:text-vc-primary transition-colors flex-shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge className="text-xs bg-vc-card border-vc-border text-vc-text-muted">
                                            {resource.type}
                                          </Badge>
                                          <Badge className={`text-xs ${getProficiencyConfig(resource.difficulty).color} border`}>
                                            {getProficiencyConfig(resource.difficulty).label}
                                          </Badge>
                                        </div>
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Skill Context */}
                            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                              <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div className="text-xs text-blue-300">
                                  <p className="font-semibold mb-1">Why this skill matters</p>
                                  <p>
                                    {skill.priority === 'critical' && 
                                      'This is a critical skill required for core functionality. Without it, the MVP cannot be built.'}
                                    {skill.priority === 'important' && 
                                      'This skill is important for a quality implementation. Consider learning it or finding help.'}
                                    {skill.priority === 'nice-to-have' && 
                                      'This skill can enhance the product but is not essential for the MVP. Can be learned later.'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Statistics */}
        <div className="mt-6 pt-4 border-t border-vc-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-vc-card border border-vc-border rounded-lg p-3 text-center">
              <div className="text-xs text-vc-text-muted mb-1">Critical Skills</div>
              <div className="text-lg font-bold text-red-400">
                {skills.filter(s => s.priority === 'critical').length}
              </div>
            </div>
            <div className="bg-vc-card border border-vc-border rounded-lg p-3 text-center">
              <div className="text-xs text-vc-text-muted mb-1">Advanced Level</div>
              <div className="text-lg font-bold text-orange-400">
                {skills.filter(s => s.proficiency === 'advanced').length}
              </div>
            </div>
            <div className="bg-vc-card border border-vc-border rounded-lg p-3 text-center">
              <div className="text-xs text-vc-text-muted mb-1">Resources</div>
              <div className="text-lg font-bold text-blue-400">
                {skills.reduce((sum, s) => sum + (s.learningResources?.length ?? 0), 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-purple-300 font-semibold text-sm mb-2">Learning Path Recommendation</h5>
              <p className="text-sm text-purple-200 leading-relaxed">
                Focus on critical skills first. For skills you don't have, consider using SaaS alternatives 
                (see Build vs Buy section) or partnering with someone who has complementary expertise. 
                Many intermediate skills can be learned on-the-job as you build.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
