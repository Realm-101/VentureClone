/**
 * Validation Service for AI-generated stage content
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  score: number; // 0-1
}

/**
 * Stage-specific validation schemas
 */
const STAGE_SCHEMAS = {
  2: {
    required: ['effortScore', 'rewardScore', 'recommendation', 'reasoning', 'automationPotential', 'resourceRequirements', 'nextSteps'],
    nested: {
      automationPotential: ['score', 'opportunities'],
      resourceRequirements: ['time', 'money', 'skills']
    }
  },
  3: {
    required: ['coreFeatures', 'niceToHaves', 'techStack', 'timeline', 'estimatedCost'],
    nested: {
      techStack: ['frontend', 'backend', 'infrastructure']
    }
  },
  4: {
    required: ['testingMethods', 'successMetrics', 'budget', 'timeline'],
    nested: {
      budget: ['total', 'breakdown']
    }
  },
  5: {
    required: ['growthChannels', 'milestones', 'resourceScaling']
  },
  6: {
    required: ['automationOpportunities', 'implementationPlan', 'estimatedSavings']
  }
};

export class ValidationService {
  /**
   * Validates AI response structure matches expected schema
   * Requirement: 10.1
   */
  validateResponseStructure(stageNumber: number, content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!content || typeof content !== 'object') {
      errors.push('Content must be a valid object');
      return { valid: false, errors, warnings };
    }

    const schema = STAGE_SCHEMAS[stageNumber as keyof typeof STAGE_SCHEMAS];
    if (!schema) {
      warnings.push(`No validation schema defined for stage ${stageNumber}`);
      return { valid: true, errors, warnings };
    }

    // Check required top-level fields
    for (const field of schema.required) {
      if (!(field in content)) {
        errors.push(`Missing required field: ${field}`);
      } else if (content[field] === null || content[field] === undefined) {
        errors.push(`Field ${field} cannot be null or undefined`);
      }
    }

    // Check nested required fields
    if ('nested' in schema && schema.nested) {
      for (const [parent, children] of Object.entries(schema.nested)) {
        if (content[parent] && typeof content[parent] === 'object') {
          for (const child of children as string[]) {
            if (!(child in content[parent])) {
              errors.push(`Missing required nested field: ${parent}.${child}`);
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates that required fields are present and non-empty
   * Requirement: 10.1
   */
  validateRequiredFields(stageNumber: number, content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const schema = STAGE_SCHEMAS[stageNumber as keyof typeof STAGE_SCHEMAS];
    if (!schema) {
      return { valid: true, errors, warnings };
    }

    // Check that array fields have content
    for (const field of schema.required) {
      if (Array.isArray(content[field])) {
        if (content[field].length === 0) {
          errors.push(`Array field ${field} cannot be empty`);
        }
      } else if (typeof content[field] === 'string') {
        if (content[field].trim().length === 0) {
          errors.push(`String field ${field} cannot be empty`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Ensures content is business-specific, not generic
   * Requirement: 10.1
   */
  validateBusinessSpecificity(content: any, businessContext: { url: string; businessModel?: string }): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const contentStr = JSON.stringify(content).toLowerCase();
    
    // Check for generic placeholder text
    const placeholders = [
      'example',
      'placeholder',
      'todo',
      'tbd',
      'to be determined',
      'insert here',
      'your business',
      'your company',
      'sample'
    ];

    for (const placeholder of placeholders) {
      if (contentStr.includes(placeholder)) {
        warnings.push(`Content contains generic placeholder: "${placeholder}"`);
      }
    }

    // Check if business URL or name is mentioned
    const businessName = businessContext.businessModel?.toLowerCase();
    const businessDomain = businessContext.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0].toLowerCase();
    
    if (businessName && !contentStr.includes(businessName)) {
      warnings.push('Content does not mention the specific business name');
    }
    
    if (businessDomain && !contentStr.includes(businessDomain)) {
      warnings.push('Content does not reference the business domain/URL');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Verifies recommendations are actionable
   * Requirement: 10.2
   */
  checkRecommendationsActionable(content: any): QualityCheckResult {
    const issues: string[] = [];
    let actionableCount = 0;
    let totalCount = 0;

    // Check various recommendation fields
    const recommendationFields = [
      'nextSteps',
      'recommendations',
      'actionItems',
      'deliverables',
      'tasks',
      'automations'
    ];

    for (const field of recommendationFields) {
      if (Array.isArray(content[field])) {
        for (const item of content[field]) {
          totalCount++;
          const itemStr = typeof item === 'string' ? item : JSON.stringify(item);
          
          // Check for action verbs
          const actionVerbs = ['create', 'build', 'implement', 'develop', 'design', 'test', 'launch', 'deploy', 'set up', 'configure', 'integrate', 'analyze', 'measure', 'track', 'optimize'];
          const hasActionVerb = actionVerbs.some(verb => itemStr.toLowerCase().includes(verb));
          
          if (hasActionVerb) {
            actionableCount++;
          } else {
            issues.push(`Recommendation may not be actionable: "${itemStr.substring(0, 50)}..."`);
          }
        }
      }
    }

    // Check nested structures
    if (content.timeline && Array.isArray(content.timeline)) {
      for (const phase of content.timeline) {
        if (Array.isArray(phase.deliverables)) {
          totalCount += phase.deliverables.length;
          actionableCount += phase.deliverables.length; // Assume deliverables are actionable
        }
      }
    }

    if (content.implementationPlan && Array.isArray(content.implementationPlan)) {
      for (const phase of content.implementationPlan) {
        if (Array.isArray(phase.automations)) {
          totalCount += phase.automations.length;
          actionableCount += phase.automations.length; // Assume automations are actionable
        }
      }
    }

    const score = totalCount > 0 ? actionableCount / totalCount : 1;
    const passed = score >= 0.7; // At least 70% should be actionable

    if (!passed) {
      issues.push(`Only ${(score * 100).toFixed(0)}% of recommendations are actionable (target: 70%)`);
    }

    return {
      passed,
      issues,
      score
    };
  }

  /**
   * Checks for placeholder text in content
   * Requirement: 10.2
   */
  checkForPlaceholders(content: any): QualityCheckResult {
    const issues: string[] = [];
    const contentStr = JSON.stringify(content);

    const placeholderPatterns = [
      /\[.*?\]/g, // [placeholder]
      /\{.*?\}/g, // {placeholder}
      /xxx+/gi,   // xxx, XXX
      /tbd/gi,    // TBD, tbd
      /todo/gi,   // TODO, todo
      /placeholder/gi,
      /example\.com/gi,
      /sample/gi,
      /insert\s+here/gi,
      /your\s+(business|company|product|service)/gi
    ];

    for (const pattern of placeholderPatterns) {
      const matches = contentStr.match(pattern);
      if (matches && matches.length > 0) {
        issues.push(`Found ${matches.length} placeholder pattern(s): ${matches.slice(0, 3).join(', ')}`);
      }
    }

    return {
      passed: issues.length === 0,
      issues,
      score: issues.length === 0 ? 1 : 0.5
    };
  }

  /**
   * Ensures estimates are realistic (not too vague or extreme)
   * Requirement: 10.2, 10.3
   */
  checkEstimatesRealistic(stageNumber: number, content: any): QualityCheckResult {
    const issues: string[] = [];
    let checksPerformed = 0;
    let checksPassed = 0;

    // Stage 2: Effort and reward scores
    if (stageNumber === 2) {
      if (typeof content.effortScore === 'number') {
        checksPerformed++;
        if (content.effortScore >= 1 && content.effortScore <= 10) {
          checksPassed++;
        } else {
          issues.push(`Effort score ${content.effortScore} is out of valid range (1-10)`);
        }
      }

      if (typeof content.rewardScore === 'number') {
        checksPerformed++;
        if (content.rewardScore >= 1 && content.rewardScore <= 10) {
          checksPassed++;
        } else {
          issues.push(`Reward score ${content.rewardScore} is out of valid range (1-10)`);
        }
      }

      if (content.automationPotential?.score !== undefined) {
        checksPerformed++;
        if (content.automationPotential.score >= 0 && content.automationPotential.score <= 1) {
          checksPassed++;
        } else {
          issues.push(`Automation potential score ${content.automationPotential.score} is out of valid range (0-1)`);
        }
      }

      // Check resource requirements are specific
      if (content.resourceRequirements) {
        checksPerformed++;
        const time = content.resourceRequirements.time?.toLowerCase() || '';
        const money = content.resourceRequirements.money?.toLowerCase() || '';
        
        const hasTimeEstimate = /\d+/.test(time) && (time.includes('month') || time.includes('week') || time.includes('day'));
        const hasMoneyEstimate = /\$\d+/.test(money) || money.includes('unknown');
        
        if (hasTimeEstimate && hasMoneyEstimate) {
          checksPassed++;
        } else {
          if (!hasTimeEstimate) issues.push('Time estimate is too vague or missing numbers');
          if (!hasMoneyEstimate) issues.push('Money estimate is too vague or missing dollar amounts');
        }
      }
    }

    // Stage 3: Timeline and cost estimates
    if (stageNumber === 3) {
      if (content.estimatedCost) {
        checksPerformed++;
        const cost = content.estimatedCost.toLowerCase();
        if (/\$\d+/.test(cost)) {
          checksPassed++;
        } else {
          issues.push('Estimated cost should include specific dollar amounts');
        }
      }

      if (Array.isArray(content.timeline)) {
        checksPerformed++;
        let hasRealisticDurations = true;
        for (const phase of content.timeline) {
          if (phase.duration) {
            const duration = phase.duration.toLowerCase();
            if (!/\d+\s*(week|month)/.test(duration)) {
              hasRealisticDurations = false;
              issues.push(`Phase "${phase.phase}" has vague duration: ${phase.duration}`);
            }
          }
        }
        if (hasRealisticDurations) checksPassed++;
      }
    }

    // Stage 4: Budget breakdown
    if (stageNumber === 4) {
      if (content.budget) {
        checksPerformed++;
        if (content.budget.total && /\$\d+/.test(content.budget.total)) {
          checksPassed++;
        } else {
          issues.push('Budget total should include specific dollar amounts');
        }

        if (Array.isArray(content.budget.breakdown)) {
          checksPerformed++;
          const allHaveCosts = content.budget.breakdown.every((item: any) => 
            item.cost && /\$\d+/.test(item.cost)
          );
          if (allHaveCosts) {
            checksPassed++;
          } else {
            issues.push('Budget breakdown items should have specific cost estimates');
          }
        }
      }
    }

    const score = checksPerformed > 0 ? checksPassed / checksPerformed : 1;
    const passed = score >= 0.8; // At least 80% of checks should pass

    return {
      passed,
      issues,
      score
    };
  }

  /**
   * Comprehensive validation combining all checks
   * Requirements: 10.1, 10.2, 10.3, 10.4
   */
  validateStageContent(
    stageNumber: number,
    content: any,
    businessContext: { url: string; businessModel?: string }
  ): {
    valid: boolean;
    structureValidation: ValidationResult;
    fieldsValidation: ValidationResult;
    specificityValidation: ValidationResult;
    actionableCheck: QualityCheckResult;
    placeholderCheck: QualityCheckResult;
    estimatesCheck: QualityCheckResult;
    overallScore: number;
  } {
    const structureValidation = this.validateResponseStructure(stageNumber, content);
    const fieldsValidation = this.validateRequiredFields(stageNumber, content);
    const specificityValidation = this.validateBusinessSpecificity(content, businessContext);
    const actionableCheck = this.checkRecommendationsActionable(content);
    const placeholderCheck = this.checkForPlaceholders(content);
    const estimatesCheck = this.checkEstimatesRealistic(stageNumber, content);

    // Calculate overall score
    const scores = [
      structureValidation.valid ? 1 : 0,
      fieldsValidation.valid ? 1 : 0,
      specificityValidation.valid ? 1 : 0,
      actionableCheck.score,
      placeholderCheck.score,
      estimatesCheck.score
    ];
    const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Content is valid if structure and fields pass, and overall score is above threshold
    const valid = structureValidation.valid && fieldsValidation.valid && overallScore >= 0.7;

    return {
      valid,
      structureValidation,
      fieldsValidation,
      specificityValidation,
      actionableCheck,
      placeholderCheck,
      estimatesCheck,
      overallScore
    };
  }
}
