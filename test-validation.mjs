import { ValidationService } from './server/services/validation';

const validationService = new ValidationService();

// Test Stage 2 validation
const stage2Content = {
  effortScore: 5,
  rewardScore: 8,
  recommendation: 'go',
  reasoning: 'This business has a strong value proposition with moderate implementation complexity.',
  automationPotential: {
    score: 0.75,
    opportunities: [
      'Automate customer support with AI chatbot',
      'Use AI for content generation',
      'Implement automated email marketing'
    ]
  },
  resourceRequirements: {
    time: '3-6 months to MVP',
    money: '\,000-\,000 initial investment',
    skills: ['React', 'Node.js', 'PostgreSQL']
  },
  nextSteps: [
    'Create landing page to test demand',
    'Build MVP with core features',
    'Launch beta to early adopters'
  ]
};

const businessContext = {
  url: 'https://example.com',
  businessModel: 'SaaS Platform'
};

const result = validationService.validateStageContent(2, stage2Content, businessContext);

console.log('Validation Result:');
console.log('- Valid:', result.valid);
console.log('- Overall Score:', (result.overallScore * 100).toFixed(1) + '%');
console.log('- Structure Valid:', result.structureValidation.valid);
console.log('- Fields Valid:', result.fieldsValidation.valid);
console.log('- Actionable Check:', result.actionableCheck.passed, '(score:', result.actionableCheck.score.toFixed(2) + ')');
console.log('- Placeholder Check:', result.placeholderCheck.passed, '(score:', result.placeholderCheck.score.toFixed(2) + ')');
console.log('- Estimates Check:', result.estimatesCheck.passed, '(score:', result.estimatesCheck.score.toFixed(2) + ')');

if (result.structureValidation.warnings.length > 0) {
  console.log('\\nWarnings:', result.structureValidation.warnings);
}

if (!result.valid) {
  console.log('\\nErrors:');
  console.log('- Structure:', result.structureValidation.errors);
  console.log('- Fields:', result.fieldsValidation.errors);
  console.log('- Specificity:', result.specificityValidation.errors);
}

console.log('\\n✅ Validation service test completed');
