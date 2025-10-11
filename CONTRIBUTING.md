# Contributing to VentureClone AI

Thank you for your interest in contributing to VentureClone AI! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Prioritize the project's best interests
- Maintain professional communication

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Git
- Code editor (VS Code recommended)
- At least one AI provider API key

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/ventureClone.git
   cd ventureClone
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ventureClone.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

5. **Initialize database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

Examples:
- `feature/add-export-csv`
- `fix/analysis-timeout`
- `docs/update-api-reference`

### Making Changes

1. **Write code** following our [coding standards](#coding-standards)
2. **Add tests** for new functionality
3. **Update documentation** as needed
4. **Test locally** to ensure everything works
5. **Commit changes** following our [commit guidelines](#commit-guidelines)

### Keeping Your Branch Updated

```bash
# Fetch latest changes
git fetch upstream

# Rebase your branch
git rebase upstream/main

# If conflicts occur, resolve them and continue
git rebase --continue
```

## Coding Standards

### TypeScript

- **Strict mode enabled** - No implicit any
- **Explicit types** - Avoid type inference where clarity helps
- **Interfaces over types** - Use interfaces for object shapes
- **Descriptive names** - Clear, self-documenting code

```typescript
// Good
interface AnalysisResult {
  score: number;
  insights: string[];
  confidence: number;
}

async function analyzeBusinessUrl(url: string): Promise<AnalysisResult> {
  // Implementation
}

// Avoid
function analyze(u: any) {
  // Implementation
}
```

### React Components

- **Functional components** with hooks
- **TypeScript props** with interfaces
- **Descriptive names** in PascalCase
- **Single responsibility** - One component, one purpose

```typescript
// Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn-${variant}`}>
      {label}
    </button>
  );
}
```

### File Organization

- **One component per file**
- **Co-locate tests** with source files
- **Group related files** in directories
- **Use index files** for clean exports

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
```

### Import Order

1. External dependencies
2. Internal absolute imports
3. Internal relative imports
4. Types
5. Styles

```typescript
// External
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Internal absolute
import { Button } from '@/components/ui/button';
import { analyzeBusinessSchema } from '@shared/schema';

// Internal relative
import { helper } from './helper';
import { service } from '../services/service';

// Types
import type { AnalysisResult } from './types';

// Styles
import './styles.css';
```

### Error Handling

- **Always handle errors** - No silent failures
- **Descriptive messages** - Help users understand what went wrong
- **Proper logging** - Log errors for debugging
- **Graceful degradation** - Provide fallbacks when possible

```typescript
// Good
try {
  const result = await analyzeUrl(url);
  return result;
} catch (error) {
  console.error('Analysis failed:', error);
  throw new Error(`Failed to analyze ${url}: ${error.message}`);
}

// Avoid
try {
  return await analyzeUrl(url);
} catch (e) {
  // Silent failure
}
```

## Testing Guidelines

### Test Coverage

- **Unit tests** for all services and utilities
- **Integration tests** for API endpoints
- **Component tests** for React components
- **E2E tests** for critical workflows

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeUrl } from './analyzer';

describe('analyzeUrl', () => {
  beforeEach(() => {
    // Setup
  });

  it('should analyze valid URL successfully', async () => {
    const result = await analyzeUrl('https://example.com');
    expect(result.score).toBeGreaterThan(0);
    expect(result.insights).toHaveLength(5);
  });

  it('should throw error for invalid URL', async () => {
    await expect(analyzeUrl('invalid')).rejects.toThrow();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- analyzer.test.ts

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain or improve coverage percentage
- Tests must pass before PR submission

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `chore` - Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(analysis): add CSV export functionality"

# Bug fix
git commit -m "fix(api): resolve timeout issue in analysis endpoint"

# Documentation
git commit -m "docs(readme): update installation instructions"

# With body
git commit -m "feat(scoring): implement new clonability algorithm

- Add weighted scoring across 5 dimensions
- Include confidence intervals
- Update tests and documentation"
```

### Commit Best Practices

- **Atomic commits** - One logical change per commit
- **Clear messages** - Describe what and why, not how
- **Present tense** - "Add feature" not "Added feature"
- **Reference issues** - Include issue numbers when applicable

## Pull Request Process

### Before Submitting

1. ✅ All tests pass locally
2. ✅ Code follows style guidelines
3. ✅ Documentation is updated
4. ✅ Commits are clean and descriptive
5. ✅ Branch is up to date with main

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub**
   - Use descriptive title
   - Fill out PR template
   - Link related issues
   - Add screenshots if UI changes

3. **PR Title Format**
   ```
   feat: Add CSV export functionality
   fix: Resolve analysis timeout issue
   docs: Update API documentation
   ```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Closes #123
```

### Review Process

1. **Automated checks** run (tests, linting)
2. **Code review** by maintainers
3. **Address feedback** if requested
4. **Approval** from at least one maintainer
5. **Merge** by maintainer

### After Merge

```bash
# Update your local main
git checkout main
git pull upstream main

# Delete feature branch
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Fixing bugs that affect usage
- Improving clarity

### Documentation Locations

- **README.md** - Project overview and quick start
- **docs/** - Detailed documentation
- **Code comments** - Complex logic explanation
- **JSDoc** - Function/class documentation

### JSDoc Example

```typescript
/**
 * Analyzes a business URL for clonability potential
 * 
 * @param url - The business URL to analyze
 * @param options - Analysis configuration options
 * @returns Promise resolving to analysis results
 * @throws {ValidationError} If URL is invalid
 * @throws {AnalysisError} If analysis fails
 * 
 * @example
 * ```typescript
 * const result = await analyzeUrl('https://example.com', {
 *   provider: 'gemini',
 *   timeout: 30000
 * });
 * ```
 */
export async function analyzeUrl(
  url: string,
  options?: AnalysisOptions
): Promise<AnalysisResult> {
  // Implementation
}
```

## Questions?

- **General questions** - Open a discussion on GitHub
- **Bug reports** - Create an issue with reproduction steps
- **Feature requests** - Open an issue with detailed description
- **Security issues** - Email security@example.com (do not open public issue)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- GitHub contributors page
- Release notes for significant features

Thank you for contributing to VentureClone AI! 🚀
