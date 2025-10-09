import type { DetectedTechnology } from './tech-detection.js';

/**
 * Complexity factors that contribute to the overall score
 */
export interface ComplexityFactors {
  customCode: boolean;
  frameworkComplexity: 'low' | 'medium' | 'high';
  infrastructureComplexity: 'low' | 'medium' | 'high';
}

/**
 * Result of complexity calculation
 */
export interface ComplexityResult {
  score: number; // 1-10 scale
  factors: ComplexityFactors;
}

/**
 * Service for calculating technical complexity based on detected technologies
 */
export class ComplexityCalculator {
  // No-code platforms (low complexity)
  private readonly noCodePlatforms = [
    'Webflow',
    'Wix',
    'Squarespace',
    'Shopify',
    'WordPress.com',
  ];

  // Modern frameworks (medium complexity)
  private readonly modernFrameworks = [
    'React',
    'Vue.js',
    'Next.js',
    'Nuxt.js',
    'Angular',
    'Svelte',
    'Gatsby',
  ];

  // Complex backend technologies
  private readonly complexBackend = [
    'Node.js',
    'Django',
    'Ruby on Rails',
    'Laravel',
    'Spring',
    'ASP.NET',
  ];

  // Microservices and container technologies
  private readonly microservicesTech = [
    'Kubernetes',
    'Docker',
    'Consul',
    'Istio',
    'Envoy',
  ];

  // Custom infrastructure indicators
  private readonly customInfra = [
    'AWS',
    'Google Cloud',
    'Azure',
    'Terraform',
    'Ansible',
  ];

  /**
   * Calculates complexity score based on detected technologies
   * @param technologies - Array of detected technologies
   * @returns Complexity score (1-10) and contributing factors
   */
  calculateComplexity(technologies: DetectedTechnology[]): ComplexityResult {
    let score = 5; // Base score
    const techNames = technologies.map(t => t.name);

    // Check for no-code platforms (-3 points)
    const hasNoCode = this.hasAnyTechnology(techNames, this.noCodePlatforms);
    if (hasNoCode) {
      score -= 3;
    }

    // Check for modern frameworks (+1 point)
    const hasModernFramework = this.hasAnyTechnology(techNames, this.modernFrameworks);
    if (hasModernFramework) {
      score += 1;
    }

    // Check for complex backend (+2 points)
    const hasComplexBackend = this.hasAnyTechnology(techNames, this.complexBackend);
    if (hasComplexBackend) {
      score += 2;
    }

    // Check for microservices/containers (+2 points)
    const hasMicroservices = this.hasAnyTechnology(techNames, this.microservicesTech);
    if (hasMicroservices) {
      score += 2;
    }

    // Check for custom infrastructure (+1 point)
    const hasCustomInfra = this.hasAnyTechnology(techNames, this.customInfra);
    if (hasCustomInfra) {
      score += 1;
    }

    // Clamp score between 1 and 10
    const finalScore = Math.max(1, Math.min(10, score));

    // Determine complexity factors
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
    };

    return {
      score: finalScore,
      factors,
    };
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
