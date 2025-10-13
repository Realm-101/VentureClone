# Deployment Verification Tasks

- [ ] 1. Verify local build works correctly
  - Run `npm run build` locally
  - Verify `dist/data/technology-knowledge-base.json` exists
  - Verify `dist/index.js` contains all service imports
  - Check `dist/public` contains all client files
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Check Render environment variables
  - Log into Render dashboard
  - Navigate to VentureClone service settings
  - Verify `STORAGE=db` (not `mem`)
  - Verify `DATABASE_URL` is set to Neon connection string
  - Verify `ENABLE_TECH_DETECTION=true`
  - Verify at least one AI provider key is set
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Clear Render build cache and force redeploy
  - Go to Render dashboard → VentureClone service
  - Click "Manual Deploy" → "Clear build cache & deploy"
  - Wait for build to complete
  - Check build logs for any errors
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Monitor deployment logs
  - Open Render logs tab
  - Look for "TechnologyKnowledgeBase loaded" message
  - Look for "Server started" message
  - Check for any "file not found" or "module not found" errors
  - Verify no errors during startup
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 5. Test deployed application
  - Visit the deployed URL
  - Submit a test URL for analysis (e.g., "https://stripe.com")
  - Wait for analysis to complete
  - Verify Clonability Score card is displayed
  - Verify Recommendations section is visible
  - Verify Estimates card shows time and cost
  - Verify Complexity Breakdown is present
  - Verify Build vs Buy section appears
  - Verify Skill Requirements section is shown
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6. Verify database persistence
  - Run a test analysis on deployed app
  - Use Neon MCP to query the database
  - Check that `technology_insights` field is populated
  - Check that `clonability_score` field is populated
  - Check that `enhanced_complexity` field is populated
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 7. Check for common deployment issues
  - Verify `package.json` includes `simple-wappalyzer` dependency
  - Verify build script includes `build:copy-data` step
  - Verify `server/data/technology-knowledge-base.json` is in git
  - Verify no `.gitignore` rules exclude necessary files
  - _Requirements: 1.1, 1.4, 4.1_

- [ ] 8. If issues persist, check file paths
  - Review `server/services/technology-knowledge-base.ts`
  - Verify it uses `process.cwd()` for file path
  - Verify path is `dist/data/technology-knowledge-base.json` in production
  - Add additional logging if needed
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9. Verify git commit deployed
  - Check Render dashboard for deployed commit hash
  - Compare with latest `git log` commit
  - Ensure they match
  - If not, trigger manual deploy from latest commit
  - _Requirements: 3.1, 3.4_

- [ ] 10. Document resolution
  - Note what the actual issue was
  - Update deployment documentation if needed
  - Add any missing environment variables to `.env.example`
  - Create deployment checklist for future reference
  - _Requirements: 8.5_
