import type { DetectedTechnology } from './tech-detection.js';

/**
 * Complexity factors that contribute to the overall score
 */
export interface ComplexityFactors {
  customCode: boolean;
  frameworkComplexity: 'low' | 'medium' | 'high';
  infrastructureComplexity: 'low' | 'medium' | 'high';
  technologyCount: number;
  licensingComplexity: boolean;
}

/**
 * Result of complexity calculation
 */
export interface ComplexityResult {
  score: number; // 1-10 scale
  factors: ComplexityFactors;
}

/**
 * Component breakdown for enhanced complexity
 */
export interface ComplexityBreakdown {
  frontend: { score: number; max: 3; technologies: string[] };
  backend: { score: number; max: 4; technologies: string[] };
  infrastructure: { score: number; max: 3; technologies: string[] };
}

/**
 * Enhanced complexity result with breakdown and explanation
 */
export interface EnhancedComplexityResult {
  score: number; // 1-10 scale
  breakdown: ComplexityBreakdown;
  factors: ComplexityFactors;
  explanation: string;
}

/**
 * Service for calculating technical complexity based on detected technologies
 */
export class ComplexityCalculator {
  // Frontend technologies categorized by complexity
  private readonly noCodePlatforms = [
    'Webflow',
    'Wix',
    'Squarespace',
    'Shopify',
    'WordPress.com',
  ];

  private readonly staticSiteGenerators = [
    'Jekyll',
    'Hugo',
    'Eleventy',
    '11ty',
  ];

  private readonly modernFrameworks = [
    'React',
    'Vue.js',
    'Next.js',
    'Nuxt.js',
    'Svelte',
    'Gatsby',
    'Astro',
  ];

  private readonly complexFrameworks = [
    'Angular',
    'Ember',
    'Backbone',
  ];

  // Backend technologies categorized by complexity
  private readonly serverlessBackend = [
    'Firebase',
    'Supabase',
    'AWS Lambda',
    'Vercel Functions',
    'Netlify Functions',
  ];

  private readonly simpleBackend = [
    'Express',
    'Flask',
    'FastAPI',
    'Sinatra',
  ];

  private readonly complexBackend = [
    'Node.js',
    'Django',
    'Ruby on Rails',
    'Laravel',
    'Spring',
    'ASP.NET',
    'NestJS',
  ];

  private readonly microservicesTech = [
    'Kubernetes',
    'Docker',
    'Consul',
    'Istio',
    'Envoy',
    'Service Mesh',
  ];

  // Infrastructure technologies categorized by complexity
  private readonly managedHosting = [
    'Vercel',
    'Netlify',
    'GitHub Pages',
    'Cloudflare Pages',
  ];

  private readonly simpleHosting = [
    'Heroku',
    'DigitalOcean',
    'Render',
    'Railway',
    'Fly.io',
  ];

  private readonly cloudPlatforms = [
    'AWS',
    'Google Cloud',
    'Azure',
    'GCP',
  ];

  private readonly containerOrchestration = [
    'Kubernetes',
    'Docker Swarm',
    'ECS',
    'EKS',
  ];

  // Commercial/licensed technologies
  private readonly commercialLicenses = [
    'Oracle',
    'Microsoft SQL Server',
    'SAP',
    'Salesforce',
    'Adobe',
  ];

  /**
   * Calculates complexity score based on detected technologies
   * @param technologies - Array of detected technologies
   * @returns Complexity score (1-10) and contributing factors
   */
  calculateComplexity(technologies: DetectedTechnology[]): ComplexityResult {
    const enhanced = this.calculateEnhancedComplexity(technologies);
    
    return {
      score: enhanced.score,
      factors: enhanced.factors,
    };
  }

  /**
   * Calculates enhanced complexity with breakdown and explanation
   * @param technologies - Array of detected technologies
   * @returns Enhanced complexity result with breakdown
   */
  calculateEnhancedComplexity(technologies: DetectedTechnology[]): EnhancedComplexityResult {
    const techNames = technologies.map(t => t.name);
    const techCount = technologies.length;

    // Calculate component breakdowns
    const breakdown = this.calculateBreakdown(techNames);
    
    // Calculate score from breakdown components
    // Start with component scores (max 10: 3+4+3)
    let score = breakdown.frontend.score + breakdown.backend.score + breakdown.infrastructure.score;

    // Add technology count factor
    if (techCount > 20) {
      score += 2;
    } else if (techCount > 10) {
      score += 1;
    }

    // Add licensing complexity
    const hasCommercialLicense = this.hasAnyTechnology(techNames, this.commercialLicenses);
    if (hasCommercialLicense) {
      score += 1;
    }

    // Clamp score between 1 and 10
    const finalScore = Math.max(1, Math.min(10, score));

    // Determine complexity factors
    const hasNoCode = this.hasAnyTechnology(techNames, this.noCodePlatforms);
    const hasModernFramework = this.hasAnyTechnology(techNames, this.modernFrameworks);
    const hasComplexBackend = this.hasAnyTechnology(techNames, this.complexBackend);
    const hasMicroservices = this.hasAnyTechnology(techNames, this.microservicesTech);
    const hasCustomInfra = this.hasAnyTechnology(techNames, this.cloudPlatforms);

    const factors: ComplexityFactors = {
      customCode: !hasNoCode && (hasModernFramework || hasComplexBackend),
      frameworkComplexity: this.determineFrameworkComplexity(
        hasNoCode,
        hasModernFramework,
        hasComplexBackend
      ),
      infrastructureComplexity: this.determineInfrastructureComplexity(
        hasMicroservices,
        hasCustomInfra
      ),
      technologyCount: techCount,
      licensingComplexity: hasCommercialLicense,
    };

    // Generate explanation
    const explanation = this.generateExplanation(finalScore, breakdown, factors);

    return {
      score: finalScore,
      breakdown,
      factors,
      explanation,
    };
  }

  /**
   * Calculates breakdown by component (frontend, backend, infrastructure)
   */
  private calculateBreakdown(techNames: string[]): ComplexityBreakdown {
    // Frontend complexity (0-3 points)
    let frontendScore = 0;
    const frontendTechs: string[] = [];

    if (this.hasAnyTechnology(techNames, this.noCodePlatforms)) {
      frontendScore = 0;
      frontendTechs.push(...this.filterTechnologies(techNames, this.noCodePlatforms));
    } else if (this.hasAnyTechnology(techNames, this.complexFrameworks)) {
      frontendScore = 3;
      frontendTechs.push(...this.filterTechnologies(techNames, this.complexFrameworks));
    } else if (this.hasAnyTechnology(techNames, this.modernFrameworks)) {
      frontendScore = 2;
      frontendTechs.push(...this.filterTechnologies(techNames, this.modernFrameworks));
    } else if (this.hasAnyTechnology(techNames, this.staticSiteGenerators)) {
      frontendScore = 1;
      frontendTechs.push(...this.filterTechnologies(techNames, this.staticSiteGenerators));
    }

    // Backend complexity (0-4 points)
    let backendScore = 0;
    const backendTechs: string[] = [];

    if (this.hasAnyTechnology(techNames, this.microservicesTech)) {
      backendScore = 4;
      backendTechs.push(...this.filterTechnologies(techNames, this.microservicesTech));
    } else if (this.hasAnyTechnology(techNames, this.complexBackend)) {
      backendScore = 3;
      backendTechs.push(...this.filterTechnologies(techNames, this.complexBackend));
    } else if (this.hasAnyTechnology(techNames, this.simpleBackend)) {
      backendScore = 2;
      backendTechs.push(...this.filterTechnologies(techNames, this.simpleBackend));
    } else if (this.hasAnyTechnology(techNames, this.serverlessBackend)) {
      backendScore = 1;
      backendTechs.push(...this.filterTechnologies(techNames, this.serverlessBackend));
    }

    // Infrastructure complexity (0-3 points)
    let infraScore = 0;
    const infraTechs: string[] = [];

    if (this.hasAnyTechnology(techNames, this.containerOrchestration)) {
      infraScore = 3;
      infraTechs.push(...this.filterTechnologies(techNames, this.containerOrchestration));
    } else if (this.hasAnyTechnology(techNames, this.cloudPlatforms)) {
      infraScore = 2;
      infraTechs.push(...this.filterTechnologies(techNames, this.cloudPlatforms));
    } else if (this.hasAnyTechnology(techNames, this.simpleHosting)) {
      infraScore = 1;
      infraTechs.push(...this.filterTechnologies(techNames, this.simpleHosting));
    } else if (this.hasAnyTechnology(techNames, this.managedHosting)) {
      infraScore = 0;
      infraTechs.push(...this.filterTechnologies(techNames, this.managedHosting));
    }

    return {
      frontend: { score: frontendScore, max: 3, technologies: frontendTechs },
      backend: { score: backendScore, max: 4, technologies: backendTechs },
      infrastructure: { score: infraScore, max: 3, technologies: infraTechs },
    };
  }

  /**
   * Generates human-readable explanation of complexity score
   */
  private generateExplanation(
    score: number,
    breakdown: ComplexityBreakdown,
    factors: ComplexityFactors
  ): string {
    const parts: string[] = [];

    // Overall assessment
    if (score <= 3) {
      parts.push('This is a low-complexity stack that should be relatively easy to clone.');
    } else if (score <= 6) {
      parts.push('This is a moderate-complexity stack that will require solid development skills.');
    } else {
      parts.push('This is a high-complexity stack that will be challenging to clone.');
    }

    // Frontend breakdown
    if (breakdown.frontend.score === 0) {
      parts.push('The frontend uses a no-code platform, minimizing development effort.');
    } else if (breakdown.frontend.score === 1) {
      parts.push('The frontend is relatively simple with static site generation.');
    } else if (breakdown.frontend.score === 2) {
      parts.push('The frontend uses modern frameworks requiring intermediate skills.');
    } else if (breakdown.frontend.score === 3) {
      parts.push('The frontend uses complex frameworks requiring advanced skills.');
    }

    // Backend breakdown
    if (breakdown.backend.score === 0) {
      parts.push('No backend detected or minimal backend requirements.');
    } else if (breakdown.backend.score === 1) {
      parts.push('The backend uses serverless/BaaS solutions, reducing complexity.');
    } else if (breakdown.backend.score === 2) {
      parts.push('The backend uses simple frameworks that are beginner-friendly.');
    } else if (breakdown.backend.score === 3) {
      parts.push('The backend uses complex frameworks requiring significant experience.');
    } else if (breakdown.backend.score === 4) {
      parts.push('The backend uses microservices architecture, requiring advanced expertise.');
    }

    // Infrastructure breakdown
    if (breakdown.infrastructure.score === 0) {
      parts.push('Infrastructure is fully managed, requiring minimal DevOps knowledge.');
    } else if (breakdown.infrastructure.score === 1) {
      parts.push('Infrastructure uses simple hosting with basic DevOps requirements.');
    } else if (breakdown.infrastructure.score === 2) {
      parts.push('Infrastructure uses cloud platforms requiring intermediate DevOps skills.');
    } else if (breakdown.infrastructure.score === 3) {
      parts.push('Infrastructure uses container orchestration requiring advanced DevOps expertise.');
    }

    // Additional factors
    if (factors.technologyCount > 20) {
      parts.push(`The large number of technologies (${factors.technologyCount}) adds significant integration complexity.`);
    } else if (factors.technologyCount > 10) {
      parts.push(`The moderate number of technologies (${factors.technologyCount}) requires careful integration.`);
    }

    if (factors.licensingComplexity) {
      parts.push('Commercial licensing adds cost and legal complexity.');
    }

    return parts.join(' ');
  }

  /**
   * Checks if any technology from the list is present
   */
  private hasAnyTechnology(detectedTech: string[], techList: string[]): boolean {
    return detectedTech.some(tech =>
      techList.some(listTech => tech.toLowerCase().includes(listTech.toLowerCase()))
    );
  }

  /**
   * Filters and returns technologies that match the given list
   */
  private filterTechnologies(detectedTech: string[], techList: string[]): string[] {
    return detectedTech.filter(tech =>
      techList.some(listTech => tech.toLowerCase().includes(listTech.toLowerCase()))
    );
  }

  /**
   * Determines framework complexity level
   */
  private determineFrameworkComplexity(
    hasNoCode: boolean,
    hasModernFramework: boolean,
    hasComplexBackend: boolean
  ): 'low' | 'medium' | 'high' {
    if (hasNoCode) return 'low';
    if (hasComplexBackend) return 'high';
    if (hasModernFramework) return 'medium';
    return 'low';
  }

  /**
   * Determines infrastructure complexity level
   */
  private determineInfrastructureComplexity(
    hasMicroservices: boolean,
    hasCustomInfra: boolean
  ): 'low' | 'medium' | 'high' {
    if (hasMicroservices) return 'high';
    if (hasCustomInfra) return 'medium';
    return 'low';
  }
}
