import { describe, it, expect, beforeAll } from 'vitest';
import { technologyKnowledgeBase } from '../services/technology-knowledge-base';

describe('TechnologyKnowledgeBase', () => {
  beforeAll(() => {
    // Ensure data is loaded before tests
    technologyKnowledgeBase.loadData();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = technologyKnowledgeBase;
      const instance2 = technologyKnowledgeBase;
      expect(instance1).toBe(instance2);
    });

    it('should load data only once', () => {
      expect(technologyKnowledgeBase.isDataLoaded()).toBe(true);
      
      // Loading again should not throw or cause issues
      technologyKnowledgeBase.loadData();
      expect(technologyKnowledgeBase.isDataLoaded()).toBe(true);
    });
  });

  describe('getTechnology', () => {
    it('should return technology profile for known technology (exact match)', () => {
      const react = technologyKnowledgeBase.getTechnology('React');
      
      expect(react).toBeDefined();
      expect(react?.name).toBe('React');
      expect(react?.category).toBe('frontend-framework');
      expect(react?.difficulty).toBe('medium');
      expect(react?.alternatives).toContain('Vue.js');
    });

    it('should be case-insensitive', () => {
      const react1 = technologyKnowledgeBase.getTechnology('React');
      const react2 = technologyKnowledgeBase.getTechnology('react');
      const react3 = technologyKnowledgeBase.getTechnology('REACT');
      
      expect(react1).toEqual(react2);
      expect(react2).toEqual(react3);
    });

    it('should return undefined for unknown technology', () => {
      const unknown = technologyKnowledgeBase.getTechnology('UnknownFramework123');
      
      expect(unknown).toBeUndefined();
    });

    it('should handle partial matches as fallback', () => {
      // This tests the partial matching logic
      const result = technologyKnowledgeBase.getTechnology('express');
      
      expect(result).toBeDefined();
      expect(result?.name).toBe('Express.js');
    });
  });

  describe('getTechnologiesByCategory', () => {
    it('should return all technologies in a category', () => {
      const frontendFrameworks = technologyKnowledgeBase.getTechnologiesByCategory('frontend-framework');
      
      expect(frontendFrameworks.length).toBeGreaterThan(0);
      expect(frontendFrameworks.every(tech => tech.category === 'frontend-framework')).toBe(true);
      
      const names = frontendFrameworks.map(t => t.name);
      expect(names).toContain('React');
      expect(names).toContain('Vue.js');
    });

    it('should return empty array for unknown category', () => {
      const unknown = technologyKnowledgeBase.getTechnologiesByCategory('unknown-category');
      
      expect(unknown).toEqual([]);
    });

    it('should return technologies for database category', () => {
      const databases = technologyKnowledgeBase.getTechnologiesByCategory('database');
      
      expect(databases.length).toBeGreaterThan(0);
      const names = databases.map(t => t.name);
      expect(names).toContain('PostgreSQL');
      expect(names).toContain('MongoDB');
    });
  });

  describe('getFallbackProfile', () => {
    it('should return generic profile for unknown technology', () => {
      const fallback = technologyKnowledgeBase.getFallbackProfile('CustomFramework');
      
      expect(fallback.name).toBe('CustomFramework');
      expect(fallback.category).toBe('unknown');
      expect(fallback.difficulty).toBe('medium');
      expect(fallback.alternatives).toEqual([]);
      expect(fallback.description).toContain('Technology details not available');
    });

    it('should use provided category in fallback', () => {
      const fallback = technologyKnowledgeBase.getFallbackProfile('CustomDB', 'database');
      
      expect(fallback.name).toBe('CustomDB');
      expect(fallback.category).toBe('database');
    });
  });

  describe('getTechnologyAlternatives', () => {
    it('should return enriched alternatives for known technology', () => {
      const alternatives = technologyKnowledgeBase.getTechnologyAlternatives('React');
      
      expect(alternatives.length).toBeGreaterThan(0);
      
      const vueAlt = alternatives.find(alt => alt.name === 'Vue.js');
      expect(vueAlt).toBeDefined();
      expect(vueAlt?.difficulty).toBe('easy');
      expect(vueAlt?.marketDemand).toBe('high');
    });

    it('should return empty array for unknown technology', () => {
      const alternatives = technologyKnowledgeBase.getTechnologyAlternatives('UnknownTech');
      
      expect(alternatives).toEqual([]);
    });
  });

  describe('getSaasAlternatives', () => {
    it('should return SaaS alternatives for service categories', () => {
      const authServices = technologyKnowledgeBase.getSaasAlternatives('authentication-service');
      
      expect(authServices.length).toBeGreaterThan(0);
      expect(authServices.every(alt => alt.category.includes('service'))).toBe(true);
    });

    it('should include cost estimates', () => {
      const authServices = technologyKnowledgeBase.getSaasAlternatives('authentication-service');
      
      if (authServices.length > 0) {
        const first = authServices[0];
        expect(first.costEstimate).toBeDefined();
        expect(first.costEstimate.development).toBeDefined();
        expect(first.costEstimate.hosting).toBeDefined();
      }
    });
  });

  describe('getLearningResources', () => {
    it('should return learning resources for known technology', () => {
      const resources = technologyKnowledgeBase.getLearningResources('React');
      
      expect(resources.length).toBeGreaterThan(0);
      expect(resources[0].url).toBeDefined();
      expect(resources[0].type).toBeDefined();
    });

    it('should infer resource types correctly', () => {
      const resources = technologyKnowledgeBase.getLearningResources('React');
      
      const docResource = resources.find(r => r.url.includes('react.dev'));
      if (docResource) {
        expect(docResource.type).toBe('documentation');
      }
      
      const tutorialResource = resources.find(r => r.url.includes('tutorial'));
      if (tutorialResource) {
        expect(tutorialResource.type).toBe('tutorial');
      }
    });

    it('should return empty array for unknown technology', () => {
      const resources = technologyKnowledgeBase.getLearningResources('UnknownTech');
      
      expect(resources).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('should return all available categories', () => {
      const categories = technologyKnowledgeBase.getCategories();
      
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('frontend-framework');
      expect(categories).toContain('backend-framework');
      expect(categories).toContain('database');
    });
  });

  describe('getAllTechnologies', () => {
    it('should return all loaded technologies', () => {
      const allTechs = technologyKnowledgeBase.getAllTechnologies();
      
      expect(allTechs.length).toBeGreaterThan(0);
      expect(allTechs.some(t => t.name === 'React')).toBe(true);
      expect(allTechs.some(t => t.name === 'PostgreSQL')).toBe(true);
    });

    it('should return technologies with complete profiles', () => {
      const allTechs = technologyKnowledgeBase.getAllTechnologies();
      
      allTechs.forEach(tech => {
        expect(tech.name).toBeDefined();
        expect(tech.category).toBeDefined();
        expect(tech.difficulty).toBeDefined();
        expect(tech.description).toBeDefined();
        expect(tech.alternatives).toBeDefined();
        expect(tech.costEstimate).toBeDefined();
        expect(tech.learningResources).toBeDefined();
        expect(tech.typicalUseCase).toBeDefined();
        expect(tech.marketDemand).toBeDefined();
      });
    });
  });

  describe('JSON Loading and Validation', () => {
    it('should have loaded data from JSON file', () => {
      expect(technologyKnowledgeBase.isDataLoaded()).toBe(true);
    });

    it('should have at least 20 technologies loaded', () => {
      const allTechs = technologyKnowledgeBase.getAllTechnologies();
      expect(allTechs.length).toBeGreaterThanOrEqual(20);
    });

    it('should have technologies in multiple categories', () => {
      const categories = technologyKnowledgeBase.getCategories();
      expect(categories.length).toBeGreaterThanOrEqual(4);
    });
  });
});
