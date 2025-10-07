# Changelog

All notable changes to VentureClone AI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-01-10

### Added
- **6-Stage Workflow System**: Complete business cloning workflow from discovery to AI automation
  - Stage 1: Discovery & Selection with cloneability scoring
  - Stage 2: Lazy-Entrepreneur Filter with effort/reward analysis
  - Stage 3: MVP Launch Planning with feature prioritization
  - Stage 4: Demand Testing Strategy with validation methods
  - Stage 5: Scaling & Growth with channel strategies
  - Stage 6: AI Automation Mapping with ROI analysis

- **Enhanced Export Functionality**
  - PDF export for all stages with professional formatting
  - HTML export with styled, responsive layouts
  - JSON export for programmatic access
  - Complete plan export combining all 6 stages
  - Business improvement export (PDF, HTML, JSON)
  - Removed CSV export (not useful for this use case)

- **Business Improvement Generator**
  - AI-powered improvement suggestions
  - 3 distinct business enhancement strategies
  - 7-day implementation plan with daily tasks
  - Export functionality for improvement plans

- **Visual Enhancements**
  - Stage progress tracker with completion indicators
  - Enhanced GO/MAYBE/NO-GO recommendation badges
  - Improved Stage 2 recommendation display with icons and descriptions
  - Better visual hierarchy and information architecture

- **Documentation**
  - Comprehensive scoring methodology document
  - Accessible via in-app link (no more 404 errors)
  - Detailed explanation of all scoring criteria
  - Transparent methodology for user understanding

### Changed
- **AI Model Upgrades**
  - Gemini: Upgraded to `gemini-2.5-pro` for better quality
  - Grok: Upgraded to `grok-4-fast-reasoning` for improved performance
  - Display names updated to reflect actual models used

- **Timeout Extensions**
  - Extended all timeouts to 120 seconds (2 minutes)
  - Accommodates more sophisticated Pro models
  - Eliminates timeout errors in complex stages
  - Test connection timeout remains at 10 seconds

- **Stage 1 Improvements**
  - Added export dropdown at top (consistent with other stages)
  - Fixed Re-analyze button functionality
  - Removed redundant bottom export button
  - Better organization of action buttons

- **Complete Export Enhancement**
  - Now includes ALL Stage 1 data (previously missing)
  - Includes scoreDetails, aiInsights, SWOT, competitors
  - Includes business improvements and 7-day plan
  - Includes first-party data and technical details
  - Much more comprehensive and useful

### Fixed
- **Export Issues**
  - Fixed complete export missing Stage 1 data
  - Fixed CSV export showing all data in single row (removed CSV entirely)
  - Fixed Stage 1 missing PDF export option
  - Fixed business improvement missing export functionality

- **Generation Issues**
  - Fixed timeout errors in Stages 3 & 4 (increased timeout)
  - Fixed resource requirements being too high (updated AI prompts)
  - Improved reliability across all stages

- **UI/UX Issues**
  - Fixed Re-analyze button not working
  - Fixed GO badge looking like a button (now clearly an indicator)
  - Fixed methodology link returning 404 error
  - Fixed AI provider display showing correct model names

- **Model Display**
  - Fixed model names in analysis records
  - Fixed display names in AI provider modal
  - Ensured consistency across all UI elements

### Removed
- **CSV Export**: Removed from all export options (not useful for this use case)
- **Old Export Component**: Removed redundant ExportAnalysis component from Stage 1

## [2.0.0] - 2024-12-XX

### Added
- Enhanced Analysis Engine with evidence-based prompts
- First-Party Data Integration for website content extraction
- Business Improvement Generator with 7-day plans
- Performance Optimization with concurrent request handling
- Advanced UI Components with confidence badges
- Comprehensive Testing suite

### Changed
- Improved AI prompts with source attribution
- Enhanced error handling and recovery
- Optimized response times

### Fixed
- Various performance and reliability issues

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- Basic business analysis functionality
- AI-powered insights
- User authentication
- Database integration

---

## Version History Summary

- **v3.0.0** (Current): 6-stage workflow, enhanced exports, Pro models, comprehensive documentation
- **v2.0.0**: Enhanced analysis, first-party data, business improvements, performance optimization
- **v1.0.0**: Initial release with basic analysis functionality

## Upgrade Notes

### Upgrading to v3.0.0

1. **Environment Variables**: Update AI model references if you have custom configurations
2. **Database**: No schema changes required - fully backward compatible
3. **Timeouts**: Be aware that operations may take up to 120 seconds (increased from 30-60s)
4. **Exports**: CSV export option has been removed - use PDF, HTML, or JSON instead

### Breaking Changes

- None - v3.0.0 is fully backward compatible with v2.0.0

## Future Roadmap

### Planned Features
- User dashboard with analysis history
- Comparison tool for multiple businesses
- Collaboration features for team analysis
- API access for programmatic analysis
- Custom scoring weights
- Industry-specific templates

### Under Consideration
- Mobile app
- Browser extension
- Automated monitoring of analyzed businesses
- Integration with business intelligence tools
- White-label options

---

For detailed information about specific changes, see the commit history or individual pull requests.
