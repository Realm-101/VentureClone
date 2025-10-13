import { z } from "zod";
export declare const zSource: z.ZodObject<{
    url: z.ZodString;
    excerpt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    excerpt: string;
}, {
    url: string;
    excerpt: string;
}>;
export type Source = z.infer<typeof zSource>;
export interface FirstPartyData {
    title: string;
    description: string;
    h1: string;
    textSnippet: string;
    url: string;
}
export interface BusinessImprovement {
    twists: string[];
    sevenDayPlan: {
        day: number;
        tasks: string[];
    }[];
    generatedAt: string;
}
export declare const structuredAnalysisSchema: z.ZodObject<{
    overview: z.ZodObject<{
        valueProposition: z.ZodString;
        targetAudience: z.ZodString;
        monetization: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    }, {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    }>;
    market: z.ZodObject<{
        competitors: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }, {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }>, "many">;
        swot: z.ZodObject<{
            strengths: z.ZodArray<z.ZodString, "many">;
            weaknesses: z.ZodArray<z.ZodString, "many">;
            opportunities: z.ZodArray<z.ZodString, "many">;
            threats: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        }, {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    }, {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    }>;
    technical: z.ZodOptional<z.ZodObject<{
        techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        uiColors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        keyPages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        actualDetected: z.ZodOptional<z.ZodObject<{
            technologies: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                categories: z.ZodArray<z.ZodString, "many">;
                confidence: z.ZodNumber;
                version: z.ZodOptional<z.ZodString>;
                website: z.ZodOptional<z.ZodString>;
                icon: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }, {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }>, "many">;
            contentType: z.ZodString;
            detectedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        }, {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        }>>;
        complexityScore: z.ZodOptional<z.ZodNumber>;
        complexityFactors: z.ZodOptional<z.ZodObject<{
            customCode: z.ZodBoolean;
            frameworkComplexity: z.ZodEnum<["low", "medium", "high"]>;
            infrastructureComplexity: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        }, {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        }>>;
        detectedTechStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        detectionAttempted: z.ZodOptional<z.ZodBoolean>;
        detectionFailed: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    }, {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    }>>;
    data: z.ZodOptional<z.ZodObject<{
        trafficEstimates: z.ZodOptional<z.ZodObject<{
            value: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            source?: string | undefined;
        }, {
            value: string;
            source?: string | undefined;
        }>>;
        keyMetrics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
            source?: string | undefined;
        }, {
            value: string;
            name: string;
            source?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
        }[] | undefined;
    }, {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
        }[] | undefined;
    }>>;
    synthesis: z.ZodObject<{
        summary: z.ZodString;
        keyInsights: z.ZodArray<z.ZodString, "many">;
        nextActions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    }, {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    }>;
}, "strip", z.ZodTypeAny, {
    overview: {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    };
    market: {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    };
    synthesis: {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    };
    technical?: {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    } | undefined;
    data?: {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
        }[] | undefined;
    } | undefined;
}, {
    overview: {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    };
    market: {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    };
    synthesis: {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    };
    technical?: {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    } | undefined;
    data?: {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
        }[] | undefined;
    } | undefined;
}>;
export declare const enhancedStructuredAnalysisSchema: z.ZodObject<{
    overview: z.ZodObject<{
        valueProposition: z.ZodString;
        targetAudience: z.ZodString;
        monetization: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    }, {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    }>;
    market: z.ZodObject<{
        competitors: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            url: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }, {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }>, "many">;
        swot: z.ZodObject<{
            strengths: z.ZodArray<z.ZodString, "many">;
            weaknesses: z.ZodArray<z.ZodString, "many">;
            opportunities: z.ZodArray<z.ZodString, "many">;
            threats: z.ZodArray<z.ZodString, "many">;
        }, "strip", z.ZodTypeAny, {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        }, {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        }>;
    }, "strip", z.ZodTypeAny, {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    }, {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    }>;
    technical: z.ZodOptional<z.ZodObject<{
        techStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        confidence: z.ZodOptional<z.ZodNumber>;
        uiColors: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        keyPages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        actualDetected: z.ZodOptional<z.ZodObject<{
            technologies: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                categories: z.ZodArray<z.ZodString, "many">;
                confidence: z.ZodNumber;
                version: z.ZodOptional<z.ZodString>;
                website: z.ZodOptional<z.ZodString>;
                icon: z.ZodOptional<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }, {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }>, "many">;
            contentType: z.ZodString;
            detectedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        }, {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        }>>;
        complexityScore: z.ZodOptional<z.ZodNumber>;
        complexityFactors: z.ZodOptional<z.ZodObject<{
            customCode: z.ZodBoolean;
            frameworkComplexity: z.ZodEnum<["low", "medium", "high"]>;
            infrastructureComplexity: z.ZodEnum<["low", "medium", "high"]>;
        }, "strip", z.ZodTypeAny, {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        }, {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        }>>;
        detectedTechStack: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        detectionAttempted: z.ZodOptional<z.ZodBoolean>;
        detectionFailed: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        confidence?: number | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    }, {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        confidence?: number | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    }>>;
    data: z.ZodOptional<z.ZodObject<{
        trafficEstimates: z.ZodOptional<z.ZodObject<{
            value: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            source?: string | undefined;
        }, {
            value: string;
            source?: string | undefined;
        }>>;
        keyMetrics: z.ZodOptional<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            value: z.ZodString;
            source: z.ZodOptional<z.ZodString>;
            asOf: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            value: string;
            name: string;
            source?: string | undefined;
            asOf?: string | undefined;
        }, {
            value: string;
            name: string;
            source?: string | undefined;
            asOf?: string | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
            asOf?: string | undefined;
        }[] | undefined;
    }, {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
            asOf?: string | undefined;
        }[] | undefined;
    }>>;
    synthesis: z.ZodObject<{
        summary: z.ZodString;
        keyInsights: z.ZodArray<z.ZodString, "many">;
        nextActions: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    }, {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    }>;
    sources: z.ZodDefault<z.ZodArray<z.ZodObject<{
        url: z.ZodString;
        excerpt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
        excerpt: string;
    }, {
        url: string;
        excerpt: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    overview: {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    };
    market: {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    };
    synthesis: {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    };
    sources: {
        url: string;
        excerpt: string;
    }[];
    technical?: {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        confidence?: number | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    } | undefined;
    data?: {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
            asOf?: string | undefined;
        }[] | undefined;
    } | undefined;
}, {
    overview: {
        valueProposition: string;
        targetAudience: string;
        monetization: string;
    };
    market: {
        competitors: {
            name: string;
            url?: string | undefined;
            notes?: string | undefined;
        }[];
        swot: {
            strengths: string[];
            weaknesses: string[];
            opportunities: string[];
            threats: string[];
        };
    };
    synthesis: {
        summary: string;
        keyInsights: string[];
        nextActions: string[];
    };
    technical?: {
        techStack?: string[] | undefined;
        uiColors?: string[] | undefined;
        keyPages?: string[] | undefined;
        confidence?: number | undefined;
        actualDetected?: {
            technologies: {
                name: string;
                categories: string[];
                confidence: number;
                version?: string | undefined;
                website?: string | undefined;
                icon?: string | undefined;
            }[];
            contentType: string;
            detectedAt: string;
        } | undefined;
        complexityScore?: number | undefined;
        complexityFactors?: {
            customCode: boolean;
            frameworkComplexity: "low" | "medium" | "high";
            infrastructureComplexity: "low" | "medium" | "high";
        } | undefined;
        detectedTechStack?: string[] | undefined;
        detectionAttempted?: boolean | undefined;
        detectionFailed?: boolean | undefined;
    } | undefined;
    data?: {
        trafficEstimates?: {
            value: string;
            source?: string | undefined;
        } | undefined;
        keyMetrics?: {
            value: string;
            name: string;
            source?: string | undefined;
            asOf?: string | undefined;
        }[] | undefined;
    } | undefined;
    sources?: {
        url: string;
        excerpt: string;
    }[] | undefined;
}>;
export type StructuredAnalysis = z.infer<typeof structuredAnalysisSchema>;
export type EnhancedStructuredAnalysis = z.infer<typeof enhancedStructuredAnalysisSchema>;
export interface DetectedTechnology {
    name: string;
    categories: string[];
    confidence: number;
    version?: string;
    website?: string;
    icon?: string;
}
export interface ComplexityFactors {
    customCode: boolean;
    frameworkComplexity: 'low' | 'medium' | 'high';
    infrastructureComplexity: 'low' | 'medium' | 'high';
}
export interface TechnicalAnalysis {
    techStack?: string[];
    confidence?: number;
    uiColors?: string[];
    keyPages?: string[];
    actualDetected?: {
        technologies: DetectedTechnology[];
        contentType: string;
        detectedAt: string;
    };
    complexityScore?: number;
    complexityFactors?: ComplexityFactors;
    detectedTechStack?: string[];
}
export interface TechnologyAlternative {
    name: string;
    reason: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    timeSavings: number;
    complexityReduction: number;
}
export interface SaasAlternative {
    name: string;
    description: string;
    pricing: string;
    timeSavings: number;
    tradeoffs: {
        pros: string[];
        cons: string[];
    };
    recommendedFor: 'mvp' | 'scale' | 'both';
}
export interface LearningResource {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'course' | 'video';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}
export interface BuildVsBuyRecommendation {
    technology: string;
    recommendation: 'build' | 'buy' | 'hybrid';
    reasoning: string;
    alternatives: string[];
    estimatedCost?: {
        build: string;
        buy: string;
    };
}
export interface SkillRequirement {
    skill: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category: string;
    estimatedLearningTime?: string;
}
export interface Recommendation {
    priority: 'high' | 'medium' | 'low';
    category: string;
    title: string;
    description: string;
    impact: string;
}
export interface ProjectEstimates {
    timeEstimate: {
        minimum: string;
        maximum: string;
        realistic: string;
    };
    costEstimate: {
        development: string;
        infrastructure: string;
        maintenance: string;
        total: string;
    };
    teamSize: {
        minimum: number;
        recommended: number;
    };
}
export interface TechnologyInsights {
    alternatives: Record<string, string[]>;
    buildVsBuy: BuildVsBuyRecommendation[];
    skills: SkillRequirement[];
    estimates: ProjectEstimates;
    recommendations: Recommendation[];
    summary?: string;
}
export interface EnhancedComplexityResult {
    score: number;
    breakdown: {
        frontend: {
            score: number;
            max: 3;
            technologies: string[];
        };
        backend: {
            score: number;
            max: 4;
            technologies: string[];
        };
        infrastructure: {
            score: number;
            max: 3;
            technologies: string[];
        };
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
export interface ClonabilityScore {
    score: number;
    rating: 'very-difficult' | 'difficult' | 'moderate' | 'easy' | 'very-easy';
    components: {
        technicalComplexity: {
            score: number;
            weight: number;
        };
        marketOpportunity: {
            score: number;
            weight: number;
        };
        resourceRequirements: {
            score: number;
            weight: number;
        };
        timeToMarket: {
            score: number;
            weight: number;
        };
    };
    recommendation: string;
    confidence: number;
}
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "users";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        username: import("drizzle-orm/pg-core").PgColumn<{
            name: "username";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        password: import("drizzle-orm/pg-core").PgColumn<{
            name: "password";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const aiProviders: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "ai_providers";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "ai_providers";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "ai_providers";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        provider: import("drizzle-orm/pg-core").PgColumn<{
            name: "provider";
            tableName: "ai_providers";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        apiKey: import("drizzle-orm/pg-core").PgColumn<{
            name: "api_key";
            tableName: "ai_providers";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "ai_providers";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "ai_providers";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const businessAnalyses: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "business_analyses";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "business_analyses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "business_analyses";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        url: import("drizzle-orm/pg-core").PgColumn<{
            name: "url";
            tableName: "business_analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        businessModel: import("drizzle-orm/pg-core").PgColumn<{
            name: "business_model";
            tableName: "business_analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        revenueStream: import("drizzle-orm/pg-core").PgColumn<{
            name: "revenue_stream";
            tableName: "business_analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        targetMarket: import("drizzle-orm/pg-core").PgColumn<{
            name: "target_market";
            tableName: "business_analyses";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        overallScore: import("drizzle-orm/pg-core").PgColumn<{
            name: "overall_score";
            tableName: "business_analyses";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        scoreDetails: import("drizzle-orm/pg-core").PgColumn<{
            name: "score_details";
            tableName: "business_analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        aiInsights: import("drizzle-orm/pg-core").PgColumn<{
            name: "ai_insights";
            tableName: "business_analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        currentStage: import("drizzle-orm/pg-core").PgColumn<{
            name: "current_stage";
            tableName: "business_analyses";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        stageData: import("drizzle-orm/pg-core").PgColumn<{
            name: "stage_data";
            tableName: "business_analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        technologyInsights: import("drizzle-orm/pg-core").PgColumn<{
            name: "technology_insights";
            tableName: "business_analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        clonabilityScore: import("drizzle-orm/pg-core").PgColumn<{
            name: "clonability_score";
            tableName: "business_analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        enhancedComplexity: import("drizzle-orm/pg-core").PgColumn<{
            name: "enhanced_complexity";
            tableName: "business_analyses";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        insightsGeneratedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "insights_generated_at";
            tableName: "business_analyses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "business_analyses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "business_analyses";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const workflowStages: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "workflow_stages";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "workflow_stages";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        analysisId: import("drizzle-orm/pg-core").PgColumn<{
            name: "analysis_id";
            tableName: "workflow_stages";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            length: number | undefined;
        }>;
        stageNumber: import("drizzle-orm/pg-core").PgColumn<{
            name: "stage_number";
            tableName: "workflow_stages";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        stageName: import("drizzle-orm/pg-core").PgColumn<{
            name: "stage_name";
            tableName: "workflow_stages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "workflow_stages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        data: import("drizzle-orm/pg-core").PgColumn<{
            name: "data";
            tableName: "workflow_stages";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        aiGeneratedContent: import("drizzle-orm/pg-core").PgColumn<{
            name: "ai_generated_content";
            tableName: "workflow_stages";
            dataType: "json";
            columnType: "PgJsonb";
            data: unknown;
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        completedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "completed_at";
            tableName: "workflow_stages";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "workflow_stages";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertUserSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodString>;
    username: z.ZodString;
    password: z.ZodString;
}, "username" | "password">, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
}, {
    username: string;
    password: string;
}>;
export declare const insertAiProviderSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodString>;
    userId: z.ZodString;
    provider: z.ZodString;
    apiKey: z.ZodString;
    isActive: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, "userId" | "provider" | "apiKey" | "isActive">, "strip", z.ZodTypeAny, {
    userId: string;
    provider: string;
    apiKey: string;
    isActive?: boolean | null | undefined;
}, {
    userId: string;
    provider: string;
    apiKey: string;
    isActive?: boolean | null | undefined;
}>;
export declare const insertBusinessAnalysisSchema: any;
export declare const insertWorkflowStageSchema: any;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type AiProvider = typeof aiProviders.$inferSelect;
export type InsertAiProvider = z.infer<typeof insertAiProviderSchema>;
export type BusinessAnalysis = typeof businessAnalyses.$inferSelect;
export type InsertBusinessAnalysis = z.infer<typeof insertBusinessAnalysisSchema>;
export type WorkflowStage = typeof workflowStages.$inferSelect;
export type InsertWorkflowStage = z.infer<typeof insertWorkflowStageSchema>;
export interface EnhancedAnalysisRecord extends BusinessAnalysis {
    structured?: EnhancedStructuredAnalysis;
    firstPartyData?: FirstPartyData;
    improvements?: BusinessImprovement;
}
export interface AnalysisRecord extends BusinessAnalysis {
    structured?: StructuredAnalysis;
}
export declare const stage2ContentSchema: z.ZodObject<{
    effortScore: z.ZodNumber;
    rewardScore: z.ZodNumber;
    recommendation: z.ZodEnum<["go", "no-go", "maybe"]>;
    reasoning: z.ZodString;
    automationPotential: z.ZodObject<{
        score: z.ZodNumber;
        opportunities: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        opportunities: string[];
        score: number;
    }, {
        opportunities: string[];
        score: number;
    }>;
    resourceRequirements: z.ZodObject<{
        time: z.ZodString;
        money: z.ZodString;
        skills: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        time: string;
        money: string;
        skills: string[];
    }, {
        time: string;
        money: string;
        skills: string[];
    }>;
    nextSteps: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    effortScore: number;
    rewardScore: number;
    recommendation: "go" | "no-go" | "maybe";
    reasoning: string;
    automationPotential: {
        opportunities: string[];
        score: number;
    };
    resourceRequirements: {
        time: string;
        money: string;
        skills: string[];
    };
    nextSteps: string[];
}, {
    effortScore: number;
    rewardScore: number;
    recommendation: "go" | "no-go" | "maybe";
    reasoning: string;
    automationPotential: {
        opportunities: string[];
        score: number;
    };
    resourceRequirements: {
        time: string;
        money: string;
        skills: string[];
    };
    nextSteps: string[];
}>;
export type Stage2Content = z.infer<typeof stage2ContentSchema>;
export declare const stage3ContentSchema: z.ZodObject<{
    coreFeatures: z.ZodArray<z.ZodString, "many">;
    niceToHaves: z.ZodArray<z.ZodString, "many">;
    techStack: z.ZodObject<{
        frontend: z.ZodArray<z.ZodString, "many">;
        backend: z.ZodArray<z.ZodString, "many">;
        infrastructure: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        frontend: string[];
        backend: string[];
        infrastructure: string[];
    }, {
        frontend: string[];
        backend: string[];
        infrastructure: string[];
    }>;
    timeline: z.ZodArray<z.ZodObject<{
        phase: z.ZodString;
        duration: z.ZodString;
        deliverables: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        phase: string;
        duration: string;
        deliverables: string[];
    }, {
        phase: string;
        duration: string;
        deliverables: string[];
    }>, "many">;
    estimatedCost: z.ZodString;
}, "strip", z.ZodTypeAny, {
    techStack: {
        frontend: string[];
        backend: string[];
        infrastructure: string[];
    };
    coreFeatures: string[];
    niceToHaves: string[];
    timeline: {
        phase: string;
        duration: string;
        deliverables: string[];
    }[];
    estimatedCost: string;
}, {
    techStack: {
        frontend: string[];
        backend: string[];
        infrastructure: string[];
    };
    coreFeatures: string[];
    niceToHaves: string[];
    timeline: {
        phase: string;
        duration: string;
        deliverables: string[];
    }[];
    estimatedCost: string;
}>;
export type Stage3Content = z.infer<typeof stage3ContentSchema>;
export declare const stage4ContentSchema: z.ZodObject<{
    testingMethods: z.ZodArray<z.ZodObject<{
        method: z.ZodString;
        description: z.ZodString;
        cost: z.ZodString;
        timeline: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timeline: string;
        method: string;
        description: string;
        cost: string;
    }, {
        timeline: string;
        method: string;
        description: string;
        cost: string;
    }>, "many">;
    successMetrics: z.ZodArray<z.ZodObject<{
        metric: z.ZodString;
        target: z.ZodString;
        measurement: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        metric: string;
        target: string;
        measurement: string;
    }, {
        metric: string;
        target: string;
        measurement: string;
    }>, "many">;
    budget: z.ZodObject<{
        total: z.ZodString;
        breakdown: z.ZodArray<z.ZodObject<{
            item: z.ZodString;
            cost: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            cost: string;
            item: string;
        }, {
            cost: string;
            item: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        total: string;
        breakdown: {
            cost: string;
            item: string;
        }[];
    }, {
        total: string;
        breakdown: {
            cost: string;
            item: string;
        }[];
    }>;
    timeline: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timeline: string;
    testingMethods: {
        timeline: string;
        method: string;
        description: string;
        cost: string;
    }[];
    successMetrics: {
        metric: string;
        target: string;
        measurement: string;
    }[];
    budget: {
        total: string;
        breakdown: {
            cost: string;
            item: string;
        }[];
    };
}, {
    timeline: string;
    testingMethods: {
        timeline: string;
        method: string;
        description: string;
        cost: string;
    }[];
    successMetrics: {
        metric: string;
        target: string;
        measurement: string;
    }[];
    budget: {
        total: string;
        breakdown: {
            cost: string;
            item: string;
        }[];
    };
}>;
export type Stage4Content = z.infer<typeof stage4ContentSchema>;
export declare const stage5ContentSchema: z.ZodObject<{
    growthChannels: z.ZodArray<z.ZodObject<{
        channel: z.ZodString;
        strategy: z.ZodString;
        priority: z.ZodEnum<["high", "medium", "low"]>;
    }, "strip", z.ZodTypeAny, {
        channel: string;
        strategy: string;
        priority: "low" | "medium" | "high";
    }, {
        channel: string;
        strategy: string;
        priority: "low" | "medium" | "high";
    }>, "many">;
    milestones: z.ZodArray<z.ZodObject<{
        milestone: z.ZodString;
        timeline: z.ZodString;
        metrics: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        timeline: string;
        milestone: string;
        metrics: string[];
    }, {
        timeline: string;
        milestone: string;
        metrics: string[];
    }>, "many">;
    resourceScaling: z.ZodArray<z.ZodObject<{
        phase: z.ZodString;
        team: z.ZodArray<z.ZodString, "many">;
        infrastructure: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        infrastructure: string;
        phase: string;
        team: string[];
    }, {
        infrastructure: string;
        phase: string;
        team: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    growthChannels: {
        channel: string;
        strategy: string;
        priority: "low" | "medium" | "high";
    }[];
    milestones: {
        timeline: string;
        milestone: string;
        metrics: string[];
    }[];
    resourceScaling: {
        infrastructure: string;
        phase: string;
        team: string[];
    }[];
}, {
    growthChannels: {
        channel: string;
        strategy: string;
        priority: "low" | "medium" | "high";
    }[];
    milestones: {
        timeline: string;
        milestone: string;
        metrics: string[];
    }[];
    resourceScaling: {
        infrastructure: string;
        phase: string;
        team: string[];
    }[];
}>;
export type Stage5Content = z.infer<typeof stage5ContentSchema>;
export declare const stage6ContentSchema: z.ZodObject<{
    automationOpportunities: z.ZodArray<z.ZodObject<{
        process: z.ZodString;
        tool: z.ZodString;
        roi: z.ZodString;
        priority: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        priority: number;
        process: string;
        tool: string;
        roi: string;
    }, {
        priority: number;
        process: string;
        tool: string;
        roi: string;
    }>, "many">;
    implementationPlan: z.ZodArray<z.ZodObject<{
        phase: z.ZodString;
        automations: z.ZodArray<z.ZodString, "many">;
        timeline: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        phase: string;
        timeline: string;
        automations: string[];
    }, {
        phase: string;
        timeline: string;
        automations: string[];
    }>, "many">;
    estimatedSavings: z.ZodString;
}, "strip", z.ZodTypeAny, {
    automationOpportunities: {
        priority: number;
        process: string;
        tool: string;
        roi: string;
    }[];
    implementationPlan: {
        phase: string;
        timeline: string;
        automations: string[];
    }[];
    estimatedSavings: string;
}, {
    automationOpportunities: {
        priority: number;
        process: string;
        tool: string;
        roi: string;
    }[];
    implementationPlan: {
        phase: string;
        timeline: string;
        automations: string[];
    }[];
    estimatedSavings: string;
}>;
export type Stage6Content = z.infer<typeof stage6ContentSchema>;
//# sourceMappingURL=schema.d.ts.map