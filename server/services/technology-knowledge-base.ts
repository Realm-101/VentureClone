import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TypeScript interfaces for technology profiles
export interface CostEstimate {
  development: string;
  hosting: string;
  maintenance: string;
}

export interface TechnologyProfile {
  name: string;
  category: string;
  difficulty: string;
  description: string;
  alternatives: string[];
  costEstimate: CostEstimate;
  learningResources: string[];
  typicalUseCase: string;
  marketDemand: string;
}

export interface TechnologyAlternative {
  name: string;
  difficulty: string;
  marketDemand: string;
}

export interface SaasAlternative {
  name: string;
  category: string;
  costEstimate: CostEstimate;
}

export interface LearningResource {
  url: string;
  type: string;
}

interface TechnologyData {
  technologies: TechnologyProfile[];
}

/**
 * TechnologyKnowledgeBase Service
 * Singleton service for managing technology profiles and providing O(1) lookups
 */
class TechnologyKnowledgeBase {
  private static instance: TechnologyKnowledgeBase;
  private technologies: Map<string, TechnologyProfile> = new Map();
  private categorizedTechnologies: Map<string, TechnologyProfile[]> = new Map();
  private isLoaded = false;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): TechnologyKnowledgeBase {
    if (!TechnologyKnowledgeBase.instance) {
      TechnologyKnowledgeBase.instance = new TechnologyKnowledgeBase();
    }
    return TechnologyKnowledgeBase.instance;
  }

  /**
   * Load technology data from JSON file
   * Should be called once on server start
   */
  public loadData(): void {
    if (this.isLoaded) {
      return; // Already loaded
    }

    try {
      const dataPath = join(__dirname, 'data/technology-knowledge-base.json');
      const rawData = readFileSync(dataPath, 'utf-8');
      const data: TechnologyData = JSON.parse(rawData);

      // Build O(1) lookup map by technology name (case-insensitive)
      this.technologies.clear();
      this.categorizedTechnologies.clear();

      for (const tech of data.technologies) {
        const normalizedName = tech.name.toLowerCase();
        this.technologies.set(normalizedName, tech);

        // Build category index
        if (!this.categorizedTechnologies.has(tech.category)) {
          this.categorizedTechnologies.set(tech.category, []);
        }
        this.categorizedTechnologies.get(tech.category)!.push(tech);
      }

      this.isLoaded = true;
      console.log(`✓ Loaded ${this.technologies.size} technologies from knowledge base`);
    } catch (error) {
      console.error('Failed to load technology knowledge base:', error);
      throw new Error('Failed to initialize technology knowledge base');
    }
  }

  /**
   * Get technology profile by name with O(1) lookup
   * Returns undefined if technology not found
   */
  public getTechnology(name: string): TechnologyProfile | undefined {
    if (!this.isLoaded) {
      this.loadData();
    }

    const normalizedName = name.toLowerCase();
    const tech = this.technologies.get(normalizedName);

    if (tech) {
      return tech;
    }

    // Fallback: try partial matching for common variations
    return this.findTechnologyByPartialMatch(normalizedName);
  }

  /**
   * Get all technologies in a specific category
   */
  public getTechnologiesByCategory(category: string): TechnologyProfile[] {
    if (!this.isLoaded) {
      this.loadData();
    }

    return this.categorizedTechnologies.get(category) || [];
  }

  /**
   * Get all available categories
   */
  public getCategories(): string[] {
    if (!this.isLoaded) {
      this.loadData();
    }

    return Array.from(this.categorizedTechnologies.keys());
  }

  /**
   * Get fallback profile for unknown technologies
   */
  public getFallbackProfile(name: string, detectedCategory?: string): TechnologyProfile {
    return {
      name,
      category: detectedCategory || 'unknown',
      difficulty: 'medium',
      description: `${name} - Technology details not available in knowledge base`,
      alternatives: [],
      costEstimate: {
        development: 'medium',
        hosting: 'medium',
        maintenance: 'medium'
      },
      learningResources: [],
      typicalUseCase: 'General purpose technology',
      marketDemand: 'medium'
    };
  }

  /**
   * Search for technology by partial name match
   * Used as fallback when exact match fails
   */
  private findTechnologyByPartialMatch(searchTerm: string): TechnologyProfile | undefined {
    // Try to find by partial match (e.g., "react.js" -> "react")
    const entries = Array.from(this.technologies.entries());
    for (const [name, tech] of entries) {
      if (name.includes(searchTerm) || searchTerm.includes(name)) {
        return tech;
      }
    }

    return undefined;
  }

  /**
   * Get technology alternatives with enriched data
   */
  public getTechnologyAlternatives(technologyName: string): TechnologyAlternative[] {
    const tech = this.getTechnology(technologyName);
    if (!tech || !tech.alternatives) {
      return [];
    }

    return tech.alternatives.map(altName => {
      const altTech = this.getTechnology(altName);
      return {
        name: altName,
        difficulty: altTech?.difficulty || 'unknown',
        marketDemand: altTech?.marketDemand || 'unknown'
      };
    });
  }

  /**
   * Get SaaS alternatives for a technology category
   */
  public getSaasAlternatives(category: string): SaasAlternative[] {
    const techs = this.getTechnologiesByCategory(category);
    
    return techs
      .filter(tech => 
        tech.category.includes('service') || 
        tech.category.includes('platform') ||
        tech.category.includes('hosting')
      )
      .map(tech => ({
        name: tech.name,
        category: tech.category,
        costEstimate: tech.costEstimate
      }));
  }

  /**
   * Get learning resources for a technology
   */
  public getLearningResources(technologyName: string): LearningResource[] {
    const tech = this.getTechnology(technologyName);
    if (!tech || !tech.learningResources) {
      return [];
    }

    return tech.learningResources.map(url => ({
      url,
      type: this.inferResourceType(url)
    }));
  }

  /**
   * Infer resource type from URL
   */
  private inferResourceType(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('docs') || lowerUrl.includes('documentation') || 
        lowerUrl.includes('.dev') || lowerUrl.includes('developer.')) {
      return 'documentation';
    }
    if (lowerUrl.includes('tutorial')) {
      return 'tutorial';
    }
    if (lowerUrl.includes('course') || lowerUrl.includes('udemy') || 
        lowerUrl.includes('egghead') || lowerUrl.includes('university')) {
      return 'course';
    }
    if (lowerUrl.includes('guide')) {
      return 'guide';
    }
    return 'resource';
  }

  /**
   * Get all technologies (for testing/debugging)
   */
  public getAllTechnologies(): TechnologyProfile[] {
    if (!this.isLoaded) {
      this.loadData();
    }

    return Array.from(this.technologies.values());
  }

  /**
   * Check if knowledge base is loaded
   */
  public isDataLoaded(): boolean {
    return this.isLoaded;
  }
}

// Export singleton instance
export const technologyKnowledgeBase = TechnologyKnowledgeBase.getInstance();
