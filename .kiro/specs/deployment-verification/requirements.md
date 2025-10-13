# Deployment Verification Requirements

## Introduction

The VentureClone application has been deployed to Render but is showing an "old version" without the tech detection enhancement features. All code is present in the repository and the database schema is up-to-date, but the deployed version is not reflecting the latest features. This spec addresses verifying and fixing the deployment to ensure all features are properly deployed and functional.

## Requirements

### Requirement 1: Verify Build Process

**User Story:** As a developer, I want to ensure the Render build process includes all necessary files and dependencies, so that the deployed application has all features.

#### Acceptance Criteria

1. WHEN the build runs THEN it SHALL copy `server/data/technology-knowledge-base.json` to `dist/data/`
2. WHEN the build completes THEN the `dist` folder SHALL contain all service files including technology-insights.ts, clonability-score.ts, and technology-knowledge-base.ts
3. WHEN the build completes THEN the `dist/public` folder SHALL contain all new UI components
4. WHEN checking the build output THEN all dependencies including `simple-wappalyzer` SHALL be installed
5. WHEN the build fails THEN clear error messages SHALL indicate what's missing

### Requirement 2: Verify Environment Variables

**User Story:** As a developer, I want to ensure all required environment variables are set on Render, so that features work correctly in production.

#### Acceptance Criteria

1. WHEN checking Render environment THEN `STORAGE` SHALL be set to `db` (not `mem`)
2. WHEN checking Render environment THEN `DATABASE_URL` SHALL be set to the Neon connection string
3. WHEN checking Render environment THEN `ENABLE_TECH_DETECTION` SHALL be set to `true`
4. WHEN checking Render environment THEN at least one AI provider key SHALL be configured
5. WHEN environment variables are missing THEN the application SHALL log clear warnings

### Requirement 3: Clear Render Build Cache

**User Story:** As a developer, I want to clear Render's build cache, so that the latest code is deployed without old cached artifacts.

#### Acceptance Criteria

1. WHEN deploying THEN Render SHALL use the latest commit from the main branch
2. WHEN build cache is cleared THEN a fresh build SHALL be triggered
3. WHEN the fresh build completes THEN all new features SHALL be present
4. WHEN checking the deployment THEN the git commit hash SHALL match the latest main branch commit
5. WHEN the deployment succeeds THEN the application version SHALL be logged

### Requirement 4: Verify Runtime File Access

**User Story:** As a developer, I want to ensure the application can access required data files at runtime, so that features don't fail due to missing files.

#### Acceptance Criteria

1. WHEN the server starts THEN it SHALL successfully load `dist/data/technology-knowledge-base.json`
2. WHEN the knowledge base fails to load THEN a clear error SHALL be logged with the file path attempted
3. WHEN checking file paths THEN they SHALL use `process.cwd()` for production compatibility
4. WHEN the application starts THEN it SHALL log successful initialization of all services
5. WHEN data files are missing THEN the application SHALL provide graceful fallbacks

### Requirement 5: Test Deployed Features

**User Story:** As a user, I want to verify that all tech detection features work on the deployed version, so that I can use the enhanced analysis capabilities.

#### Acceptance Criteria

1. WHEN analyzing a URL on the deployed app THEN technology detection SHALL run successfully
2. WHEN viewing analysis results THEN the Clonability Score card SHALL be displayed
3. WHEN viewing analysis results THEN Recommendations, Estimates, and Complexity Breakdown SHALL be visible
4. WHEN viewing analysis results THEN Build vs Buy and Skill Requirements sections SHALL be present
5. WHEN features fail THEN clear error messages SHALL be shown to the user

### Requirement 6: Monitor Deployment Logs

**User Story:** As a developer, I want to review Render deployment logs, so that I can identify any runtime errors or missing dependencies.

#### Acceptance Criteria

1. WHEN the application starts THEN initialization logs SHALL confirm all services loaded
2. WHEN technology detection runs THEN performance metrics SHALL be logged
3. WHEN insights generation runs THEN cache hits/misses SHALL be logged
4. WHEN errors occur THEN structured error logs SHALL include service name, action, and error details
5. WHEN checking logs THEN no "file not found" or "module not found" errors SHALL be present

### Requirement 7: Database Connection Verification

**User Story:** As a developer, I want to verify the Neon database connection works correctly, so that analysis data is persisted.

#### Acceptance Criteria

1. WHEN the application starts THEN it SHALL successfully connect to the Neon database
2. WHEN an analysis is saved THEN all new fields (technologyInsights, clonabilityScore, enhancedComplexity) SHALL be populated
3. WHEN querying the database THEN saved analyses SHALL include the new insight data
4. WHEN the database connection fails THEN a clear error SHALL be logged
5. WHEN checking the database THEN the schema SHALL match the latest migration

### Requirement 8: Force Redeploy Strategy

**User Story:** As a developer, I want a clear strategy to force a complete redeploy, so that I can ensure the latest code is running.

#### Acceptance Criteria

1. WHEN forcing a redeploy THEN the build cache SHALL be cleared
2. WHEN forcing a redeploy THEN all dependencies SHALL be reinstalled
3. WHEN forcing a redeploy THEN the latest git commit SHALL be used
4. WHEN the redeploy completes THEN the deployment SHALL be verified with a test analysis
5. WHEN the redeploy succeeds THEN the deployment timestamp SHALL be updated
