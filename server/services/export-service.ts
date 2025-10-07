import type { IStorage, AnalysisRecord, StagesRecord } from "../minimal-storage";
import type {
  Stage2Content,
  Stage3Content,
  Stage4Content,
  Stage5Content,
  Stage6Content,
} from "@shared/schema";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

/**
 * ExportService handles generation of complete business plans
 * Aggregates data from all 6 workflow stages into exportable formats
 */
export class ExportService {
  constructor(private storage: IStorage) {}

  /**
   * Aggregates all stage data for a business analysis
   * Returns complete plan data ready for export
   */
  async aggregateCompletePlan(userId: string, analysisId: string): Promise<CompletePlanData> {
    // Get the analysis record
    const analysis = await this.storage.getAnalysis(userId, analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    // Get all stages
    const stages = await this.storage.getAnalysisStages(userId, analysisId);
    if (!stages) {
      throw new Error("No stage data found");
    }

    // Extract stage content with proper typing
    const stage1 = stages[1];
    const stage2 = stages[2]?.content as Stage2Content | undefined;
    const stage3 = stages[3]?.content as Stage3Content | undefined;
    const stage4 = stages[4]?.content as Stage4Content | undefined;
    const stage5 = stages[5]?.content as Stage5Content | undefined;
    const stage6 = stages[6]?.content as Stage6Content | undefined;

    return {
      metadata: {
        businessName: analysis.businessModel || "Business Analysis",
        url: analysis.url,
        generatedAt: new Date().toISOString(),
        analysisId: analysis.id,
      },
      stage1: {
        name: "Discovery & Selection",
        summary: analysis.summary,
        url: analysis.url,
        overallScore: analysis.overallScore,
        structured: analysis.structured,
        scoreDetails: analysis.scoreDetails,
        aiInsights: analysis.aiInsights,
        firstPartyData: analysis.firstPartyData,
        improvements: analysis.improvements,
        businessModel: analysis.businessModel,
        revenueStream: analysis.revenueStream,
        targetMarket: analysis.targetMarket,
      },
      stage2: stage2 ? {
        name: "Lazy-Entrepreneur Filter",
        ...stage2,
      } : undefined,
      stage3: stage3 ? {
        name: "MVP Launch Planning",
        ...stage3,
      } : undefined,
      stage4: stage4 ? {
        name: "Demand Testing Strategy",
        ...stage4,
      } : undefined,
      stage5: stage5 ? {
        name: "Scaling & Growth",
        ...stage5,
      } : undefined,
      stage6: stage6 ? {
        name: "AI Automation Mapping",
        ...stage6,
      } : undefined,
    };
  }

  /**
   * Generates JSON export of complete plan
   */
  async exportJSON(userId: string, analysisId: string): Promise<string> {
    const planData = await this.aggregateCompletePlan(userId, analysisId);
    return JSON.stringify(planData, null, 2);
  }

  /**
   * Generates HTML export of complete plan
   */
  async exportHTML(userId: string, analysisId: string): Promise<string> {
    const planData = await this.aggregateCompletePlan(userId, analysisId);
    return this.generateHTMLDocument(planData);
  }

  /**
   * Generates PDF export of complete plan
   */
  async exportPDF(userId: string, analysisId: string): Promise<Buffer> {
    const planData = await this.aggregateCompletePlan(userId, analysisId);
    return this.generatePDFDocument(planData);
  }

  /**
   * Exports a specific stage in the requested format
   */
  async exportStage(
    userId: string,
    analysisId: string,
    stageNumber: number,
    format: 'html' | 'json' | 'pdf'
  ): Promise<Buffer | string> {
    // Get the analysis and stage data
    const analysis = await this.storage.getAnalysis(userId, analysisId);
    if (!analysis) {
      throw new Error("Analysis not found");
    }

    const stages = await this.storage.getAnalysisStages(userId, analysisId);
    if (!stages) {
      throw new Error("No stages found");
    }

    const stageData = stages[stageNumber as keyof StagesRecord];
    if (!stageData) {
      throw new Error(`Stage ${stageNumber} not found`);
    }
    const stageName = this.getStageName(stageNumber);

    // Generate export based on format
    switch (format) {
      case 'json':
        return this.exportStageJSON(stageData, stageName);
      case 'html':
        return this.exportStageHTML(stageData, stageName, analysis);
      case 'pdf':
        return this.exportStagePDF(stageData, stageName, analysis);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private getStageName(stageNumber: number): string {
    const names: Record<number, string> = {
      1: "Discovery & Selection",
      2: "Lazy-Entrepreneur Filter",
      3: "MVP Launch Planning",
      4: "Demand Testing Strategy",
      5: "Scaling & Growth",
      6: "AI Automation Mapping",
    };
    return names[stageNumber] || `Stage ${stageNumber}`;
  }

  private exportStageJSON(stageData: any, stageName: string): string {
    return JSON.stringify({
      stageName,
      ...stageData,
    }, null, 2);
  }

  private exportStageHTML(stageData: any, stageName: string, analysis: AnalysisRecord): string {
    const stageNumber = this.getStageNumber(stageName);
    let stageContent = '';

    switch (stageNumber) {
      case 1:
        stageContent = this.renderStage1HTML({
          name: stageName,
          summary: analysis.summary,
          url: analysis.url,
          overallScore: analysis.overallScore,
          structured: analysis.structured,
        });
        break;
      case 2:
        stageContent = this.renderStage2HTML({ name: stageName, ...stageData.content });
        break;
      case 3:
        stageContent = this.renderStage3HTML({ name: stageName, ...stageData.content });
        break;
      case 4:
        stageContent = this.renderStage4HTML({ name: stageName, ...stageData.content });
        break;
      case 5:
        stageContent = this.renderStage5HTML({ name: stageName, ...stageData.content });
        break;
      case 6:
        stageContent = this.renderStage6HTML({ name: stageName, ...stageData.content });
        break;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${analysis.businessModel || 'Business'} - ${stageName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    .stage {
      background: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stage h2 {
      color: #667eea;
      margin-top: 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stage h3 {
      color: #555;
      margin-top: 25px;
    }
    .score-badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin: 5px 5px 5px 0;
    }
    .recommendation {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      font-weight: 500;
    }
    .recommendation.go {
      background: #d1fae5;
      border-left: 4px solid #10b981;
    }
    .recommendation.no-go {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    .recommendation.maybe {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    ul, ol {
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
    }
    .timeline-item {
      border-left: 3px solid #667eea;
      padding-left: 20px;
      margin: 20px 0;
    }
    .priority-high { color: #ef4444; font-weight: bold; }
    .priority-medium { color: #f59e0b; font-weight: bold; }
    .priority-low { color: #10b981; font-weight: bold; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${analysis.businessModel || 'Business Analysis'}</h1>
    <div>Stage ${stageNumber}: ${stageName}</div>
  </div>

  ${stageContent}

  <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 0.9em;">
    <p>Generated by VentureClone AI</p>
  </div>
</body>
</html>`;
  }

  private async exportStagePDF(stageData: any, stageName: string, analysis: AnalysisRecord): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold')
        .text(analysis.businessModel || 'Business Analysis');
      doc.fontSize(16).font('Helvetica')
        .text(stageName);
      doc.moveDown(2);

      // Stage content
      const stageNumber = this.getStageNumber(stageName);
      switch (stageNumber) {
        case 1:
          this.addStage1PDF(doc, {
            name: stageName,
            summary: analysis.summary,
            url: analysis.url,
            overallScore: analysis.overallScore,
          });
          break;
        case 2:
          this.addStage2PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 3:
          this.addStage3PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 4:
          this.addStage4PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 5:
          this.addStage5PDF(doc, { name: stageName, ...stageData.content });
          break;
        case 6:
          this.addStage6PDF(doc, { name: stageName, ...stageData.content });
          break;
      }

      doc.end();
    });
  }

  private getStageNumber(stageName: string): number {
    const names: Record<string, number> = {
      "Discovery & Selection": 1,
      "Lazy-Entrepreneur Filter": 2,
      "MVP Launch Planning": 3,
      "Demand Testing Strategy": 4,
      "Scaling & Growth": 5,
      "AI Automation Mapping": 6,
    };
    return names[stageName] || 1;
  }

  /**
   * Generates PDF document from plan data using PDFKit
   */
  private async generatePDFDocument(planData: CompletePlanData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `${planData.metadata.businessName} - Complete Business Plan`,
          Author: 'VentureClone AI',
          Subject: 'Business Cloning Analysis',
          CreationDate: new Date(planData.metadata.generatedAt),
        }
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Cover page
      this.addCoverPage(doc, planData.metadata);
      
      // Table of contents
      doc.addPage();
      this.addTableOfContents(doc, planData);

      // Stage 1
      doc.addPage();
      this.addStage1PDF(doc, planData.stage1);

      // Stage 2
      if (planData.stage2) {
        doc.addPage();
        this.addStage2PDF(doc, planData.stage2);
      }

      // Stage 3
      if (planData.stage3) {
        doc.addPage();
        this.addStage3PDF(doc, planData.stage3);
      }

      // Stage 4
      if (planData.stage4) {
        doc.addPage();
        this.addStage4PDF(doc, planData.stage4);
      }

      // Stage 5
      if (planData.stage5) {
        doc.addPage();
        this.addStage5PDF(doc, planData.stage5);
      }

      // Stage 6
      if (planData.stage6) {
        doc.addPage();
        this.addStage6PDF(doc, planData.stage6);
      }

      // Footer
      this.addFooter(doc);

      doc.end();
    });
  }

  private addCoverPage(doc: PDFKit.PDFDocument, metadata: CompletePlanData['metadata']): void {
    doc.fontSize(32).font('Helvetica-Bold')
      .text(metadata.businessName, { align: 'center' });
    
    doc.moveDown(2);
    doc.fontSize(20).font('Helvetica')
      .text('Complete Business Plan', { align: 'center' });
    
    doc.moveDown(4);
    doc.fontSize(12).font('Helvetica')
      .text(`URL: ${metadata.url}`, { align: 'center' })
      .text(`Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}`, { align: 'center' });
    
    doc.moveDown(8);
    doc.fontSize(10).fillColor('#666')
      .text('Generated by VentureClone AI', { align: 'center' })
      .text('Systematic Business Cloning Platform', { align: 'center' });
  }

  private addTableOfContents(doc: PDFKit.PDFDocument, planData: CompletePlanData): void {
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#000')
      .text('Table of Contents');
    
    doc.moveDown(1);
    doc.fontSize(12).font('Helvetica');
    
    const toc = [
      'Stage 1: Discovery & Selection',
      planData.stage2 ? 'Stage 2: Lazy-Entrepreneur Filter' : null,
      planData.stage3 ? 'Stage 3: MVP Launch Planning' : null,
      planData.stage4 ? 'Stage 4: Demand Testing Strategy' : null,
      planData.stage5 ? 'Stage 5: Scaling & Growth' : null,
      planData.stage6 ? 'Stage 6: AI Automation Mapping' : null,
    ].filter(Boolean);

    toc.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`);
      doc.moveDown(0.5);
    });
  }

  private addStage1PDF(doc: PDFKit.PDFDocument, stage1: any): void {
    this.addSectionHeader(doc, `Stage 1: ${stage1.name}`);
    
    // Business Information
    doc.fontSize(14).font('Helvetica-Bold').text('Business Information');
    doc.fontSize(12).font('Helvetica')
      .text(`URL: ${stage1.url}`);
    if (stage1.businessModel) {
      doc.text(`Business Model: ${stage1.businessModel}`);
    }
    if (stage1.revenueStream) {
      doc.text(`Revenue Stream: ${stage1.revenueStream}`);
    }
    if (stage1.targetMarket) {
      doc.text(`Target Market: ${stage1.targetMarket}`);
    }
    
    // Summary
    doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Summary');
    doc.fontSize(12).font('Helvetica').text(stage1.summary);
    
    // Overall Score
    if (stage1.overallScore) {
      doc.moveDown(1).fontSize(14).font('Helvetica-Bold')
        .text(`Overall Score: ${stage1.overallScore}/10`);
    }
    
    // Detailed Scoring
    if (stage1.scoreDetails) {
      doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Detailed Scoring');
      doc.fontSize(12).font('Helvetica');
      for (const [key, value] of Object.entries(stage1.scoreDetails)) {
        const detail = value as any;
        doc.moveDown(0.5).font('Helvetica-Bold')
          .text(`${this.formatCamelCase(key)}: ${detail.score}/10`);
        doc.font('Helvetica').text(detail.reasoning || '');
      }
    }
    
    // AI Insights
    if (stage1.aiInsights) {
      if (stage1.aiInsights.keyInsights?.length > 0) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Key Insights');
        doc.fontSize(12).font('Helvetica');
        stage1.aiInsights.keyInsights.forEach((insight: string) => {
          doc.text(`• ${insight}`);
        });
      }
      if (stage1.aiInsights.opportunities?.length > 0) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Opportunities');
        doc.fontSize(12).font('Helvetica');
        stage1.aiInsights.opportunities.forEach((opp: string) => {
          doc.text(`• ${opp}`);
        });
      }
      if (stage1.aiInsights.risks?.length > 0) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Risks');
        doc.fontSize(12).font('Helvetica');
        stage1.aiInsights.risks.forEach((risk: string) => {
          doc.text(`• ${risk}`);
        });
      }
    }
    
    // Structured Analysis
    if (stage1.structured) {
      const s = stage1.structured;
      
      if (s.overview) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Business Overview');
        doc.fontSize(12).font('Helvetica')
          .text(`Value Proposition: ${s.overview.valueProposition || 'N/A'}`)
          .text(`Target Audience: ${s.overview.targetAudience || 'N/A'}`)
          .text(`Monetization: ${s.overview.monetization || 'N/A'}`);
      }
      
      if (s.market?.competitors?.length > 0) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Competitors');
        doc.fontSize(12).font('Helvetica');
        s.market.competitors.forEach((comp: any) => {
          doc.text(`• ${comp.name}${comp.url ? ` (${comp.url})` : ''}${comp.notes ? `: ${comp.notes}` : ''}`);
        });
      }
      
      if (s.market?.swot) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('SWOT Analysis');
        doc.fontSize(12);
        
        if (s.market.swot.strengths?.length > 0) {
          doc.font('Helvetica-Bold').text('Strengths:');
          doc.font('Helvetica');
          s.market.swot.strengths.forEach((item: string) => {
            doc.text(`• ${item}`);
          });
        }
        if (s.market.swot.weaknesses?.length > 0) {
          doc.moveDown(0.5).font('Helvetica-Bold').text('Weaknesses:');
          doc.font('Helvetica');
          s.market.swot.weaknesses.forEach((item: string) => {
            doc.text(`• ${item}`);
          });
        }
        if (s.market.swot.opportunities?.length > 0) {
          doc.moveDown(0.5).font('Helvetica-Bold').text('Opportunities:');
          doc.font('Helvetica');
          s.market.swot.opportunities.forEach((item: string) => {
            doc.text(`• ${item}`);
          });
        }
        if (s.market.swot.threats?.length > 0) {
          doc.moveDown(0.5).font('Helvetica-Bold').text('Threats:');
          doc.font('Helvetica');
          s.market.swot.threats.forEach((item: string) => {
            doc.text(`• ${item}`);
          });
        }
      }
      
      if (s.technical) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Technical Details');
        doc.fontSize(12).font('Helvetica');
        if (s.technical.techStack?.length > 0) {
          doc.text(`Tech Stack: ${s.technical.techStack.join(', ')}`);
        }
        if (s.technical.uiColors?.length > 0) {
          doc.text(`UI Colors: ${s.technical.uiColors.join(', ')}`);
        }
        if (s.technical.keyPages?.length > 0) {
          doc.text('Key Pages:');
          s.technical.keyPages.forEach((page: string) => {
            doc.text(`• ${page}`);
          });
        }
      }
    }
    
    // Business Improvements
    if (stage1.improvements) {
      if (stage1.improvements.twists?.length > 0) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('Business Improvement Twists');
        doc.fontSize(12).font('Helvetica');
        stage1.improvements.twists.forEach((twist: string) => {
          doc.text(`• ${twist}`);
        });
      }
      if (stage1.improvements.sevenDayPlan?.length > 0) {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold').text('7-Day Action Plan');
        doc.fontSize(12);
        stage1.improvements.sevenDayPlan.forEach((day: any) => {
          doc.moveDown(0.5).font('Helvetica-Bold').text(`Day ${day.day}:`);
          doc.font('Helvetica');
          day.tasks.forEach((task: string) => {
            doc.text(`• ${task}`);
          });
        });
      }
    }
  }

  private addStage2PDF(doc: PDFKit.PDFDocument, stage2: any): void {
    this.addSectionHeader(doc, `Stage 2: ${stage2.name}`);
    
    doc.fontSize(12).font('Helvetica-Bold')
      .text(`Effort Score: ${stage2.effortScore}/10 | Reward Score: ${stage2.rewardScore}/10`);
    
    doc.moveDown(0.5).font('Helvetica')
      .text(`Recommendation: ${stage2.recommendation.toUpperCase()}`);
    
    doc.moveDown(1).font('Helvetica-Bold').text('Reasoning:');
    doc.font('Helvetica').text(stage2.reasoning);
    
    doc.moveDown(1).font('Helvetica-Bold')
      .text(`Automation Potential: ${Math.round(stage2.automationPotential.score * 100)}%`);
    doc.font('Helvetica');
    stage2.automationPotential.opportunities.forEach((opp: string) => {
      doc.text(`• ${opp}`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Resource Requirements:');
    doc.font('Helvetica')
      .text(`Time: ${stage2.resourceRequirements.time}`)
      .text(`Money: ${stage2.resourceRequirements.money}`)
      .text(`Skills: ${stage2.resourceRequirements.skills.join(', ')}`);
    
    doc.moveDown(1).font('Helvetica-Bold').text('Next Steps:');
    doc.font('Helvetica');
    stage2.nextSteps.forEach((step: string, index: number) => {
      doc.text(`${index + 1}. ${step}`);
    });
  }

  private addStage3PDF(doc: PDFKit.PDFDocument, stage3: any): void {
    this.addSectionHeader(doc, `Stage 3: ${stage3.name}`);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Core Features (MVP):');
    doc.font('Helvetica');
    stage3.coreFeatures.forEach((feature: string) => {
      doc.text(`• ${feature}`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Nice-to-Have Features:');
    doc.font('Helvetica');
    stage3.niceToHaves.forEach((feature: string) => {
      doc.text(`• ${feature}`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Technology Stack:');
    doc.font('Helvetica')
      .text(`Frontend: ${stage3.techStack.frontend.join(', ')}`)
      .text(`Backend: ${stage3.techStack.backend.join(', ')}`)
      .text(`Infrastructure: ${stage3.techStack.infrastructure.join(', ')}`);
    
    doc.moveDown(1).font('Helvetica-Bold').text('Development Timeline:');
    stage3.timeline.forEach((phase: any) => {
      doc.moveDown(0.5).font('Helvetica-Bold')
        .text(`${phase.phase} (${phase.duration})`);
      doc.font('Helvetica');
      phase.deliverables.forEach((d: string) => {
        doc.text(`  • ${d}`);
      });
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Estimated Cost:');
    doc.font('Helvetica').text(stage3.estimatedCost);
  }

  private addStage4PDF(doc: PDFKit.PDFDocument, stage4: any): void {
    this.addSectionHeader(doc, `Stage 4: ${stage4.name}`);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Testing Methods:');
    stage4.testingMethods.forEach((method: any) => {
      doc.moveDown(0.5).font('Helvetica-Bold').text(method.method);
      doc.font('Helvetica')
        .text(method.description)
        .text(`Cost: ${method.cost} | Timeline: ${method.timeline}`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Success Metrics:');
    doc.font('Helvetica');
    stage4.successMetrics.forEach((metric: any) => {
      doc.text(`• ${metric.metric}: ${metric.target}`);
      doc.text(`  Measurement: ${metric.measurement}`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Budget:');
    doc.font('Helvetica').text(`Total: ${stage4.budget.total}`);
    stage4.budget.breakdown.forEach((item: any) => {
      doc.text(`• ${item.item}: ${item.cost}`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Timeline:');
    doc.font('Helvetica').text(stage4.timeline);
  }

  private addStage5PDF(doc: PDFKit.PDFDocument, stage5: any): void {
    this.addSectionHeader(doc, `Stage 5: ${stage5.name}`);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Growth Channels:');
    stage5.growthChannels.forEach((channel: any) => {
      doc.moveDown(0.5).font('Helvetica-Bold')
        .text(`${channel.channel} [${channel.priority.toUpperCase()}]`);
      doc.font('Helvetica').text(channel.strategy);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Growth Milestones:');
    stage5.milestones.forEach((milestone: any) => {
      doc.moveDown(0.5).font('Helvetica-Bold')
        .text(`${milestone.milestone} (${milestone.timeline})`);
      doc.font('Helvetica');
      milestone.metrics.forEach((m: string) => {
        doc.text(`  • ${m}`);
      });
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Resource Scaling Plan:');
    stage5.resourceScaling.forEach((phase: any) => {
      doc.moveDown(0.5).font('Helvetica-Bold').text(phase.phase);
      doc.font('Helvetica')
        .text(`Team: ${phase.team.join(', ')}`)
        .text(`Infrastructure: ${phase.infrastructure}`);
    });
  }

  private addStage6PDF(doc: PDFKit.PDFDocument, stage6: any): void {
    this.addSectionHeader(doc, `Stage 6: ${stage6.name}`);
    
    doc.fontSize(12).font('Helvetica-Bold').text('Automation Opportunities:');
    doc.font('Helvetica');
    stage6.automationOpportunities.forEach((opp: any) => {
      doc.text(`• ${opp.process} → ${opp.tool}`);
      doc.text(`  ROI: ${opp.roi} | Priority: ${opp.priority}/10`);
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Implementation Plan:');
    stage6.implementationPlan.forEach((phase: any) => {
      doc.moveDown(0.5).font('Helvetica-Bold')
        .text(`${phase.phase} (${phase.timeline})`);
      doc.font('Helvetica');
      phase.automations.forEach((a: string) => {
        doc.text(`  • ${a}`);
      });
    });
    
    doc.moveDown(1).font('Helvetica-Bold').text('Estimated Savings:');
    doc.font('Helvetica').text(stage6.estimatedSavings);
  }

  private addSectionHeader(doc: PDFKit.PDFDocument, title: string): void {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#667eea')
      .text(title);
    doc.moveDown(1).fillColor('#000');
  }

  private addFooter(doc: PDFKit.PDFDocument): void {
    doc.addPage();
    doc.fontSize(10).fillColor('#666').font('Helvetica')
      .text('Generated by VentureClone AI', { align: 'center' })
      .moveDown(0.5)
      .text('This document contains AI-generated analysis and recommendations.', { align: 'center' })
      .text('Please validate all information independently.', { align: 'center' });
  }

  /**
   * Generates formatted HTML document from plan data
   */
  private generateHTMLDocument(planData: CompletePlanData): string {
    const { metadata, stage1, stage2, stage3, stage4, stage5, stage6 } = planData;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metadata.businessName} - Complete Business Plan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    .header .meta {
      opacity: 0.9;
      font-size: 0.95em;
    }
    .stage {
      background: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stage h2 {
      color: #667eea;
      margin-top: 0;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    .stage h3 {
      color: #555;
      margin-top: 25px;
    }
    .score-badge {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 5px 15px;
      border-radius: 20px;
      font-weight: bold;
      margin: 5px 5px 5px 0;
    }
    .recommendation {
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      font-weight: 500;
    }
    .recommendation.go {
      background: #d1fae5;
      border-left: 4px solid #10b981;
    }
    .recommendation.no-go {
      background: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    .recommendation.maybe {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    ul, ol {
      padding-left: 25px;
    }
    li {
      margin: 8px 0;
    }
    .timeline-item {
      border-left: 3px solid #667eea;
      padding-left: 20px;
      margin: 20px 0;
    }
    .priority-high { color: #ef4444; font-weight: bold; }
    .priority-medium { color: #f59e0b; font-weight: bold; }
    .priority-low { color: #10b981; font-weight: bold; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f3f4f6;
      font-weight: 600;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${metadata.businessName}</h1>
    <div class="meta">
      <div>URL: <a href="${metadata.url}" style="color: white;">${metadata.url}</a></div>
      <div>Generated: ${new Date(metadata.generatedAt).toLocaleDateString()}</div>
    </div>
  </div>

  ${this.renderStage1HTML(stage1)}
  ${stage2 ? this.renderStage2HTML(stage2) : ''}
  ${stage3 ? this.renderStage3HTML(stage3) : ''}
  ${stage4 ? this.renderStage4HTML(stage4) : ''}
  ${stage5 ? this.renderStage5HTML(stage5) : ''}
  ${stage6 ? this.renderStage6HTML(stage6) : ''}

  <div class="footer">
    <p>Generated by VentureClone AI</p>
    <p>This document contains AI-generated analysis and recommendations. Please validate all information independently.</p>
  </div>
</body>
</html>`;
  }

  private renderStage1HTML(stage1: any): string {
    // Build score details HTML
    let scoreDetailsHTML = '';
    if (stage1.scoreDetails) {
      scoreDetailsHTML = '<h3>Detailed Scoring</h3><table>';
      for (const [key, value] of Object.entries(stage1.scoreDetails)) {
        const detail = value as any;
        scoreDetailsHTML += `
          <tr>
            <td><strong>${this.formatCamelCase(key)}</strong></td>
            <td><span class="score-badge">${detail.score}/10</span></td>
            <td>${detail.reasoning || ''}</td>
          </tr>`;
      }
      scoreDetailsHTML += '</table>';
    }

    // Build AI insights HTML
    let aiInsightsHTML = '';
    if (stage1.aiInsights) {
      if (stage1.aiInsights.keyInsights?.length > 0) {
        aiInsightsHTML += '<h3>Key Insights</h3><ul>';
        stage1.aiInsights.keyInsights.forEach((insight: string) => {
          aiInsightsHTML += `<li>${insight}</li>`;
        });
        aiInsightsHTML += '</ul>';
      }
      if (stage1.aiInsights.opportunities?.length > 0) {
        aiInsightsHTML += '<h3>Opportunities</h3><ul>';
        stage1.aiInsights.opportunities.forEach((opp: string) => {
          aiInsightsHTML += `<li>${opp}</li>`;
        });
        aiInsightsHTML += '</ul>';
      }
      if (stage1.aiInsights.risks?.length > 0) {
        aiInsightsHTML += '<h3>Risks</h3><ul>';
        stage1.aiInsights.risks.forEach((risk: string) => {
          aiInsightsHTML += `<li>${risk}</li>`;
        });
        aiInsightsHTML += '</ul>';
      }
    }

    // Build structured analysis HTML
    let structuredHTML = '';
    if (stage1.structured) {
      const s = stage1.structured;
      structuredHTML += '<h3>Business Overview</h3>';
      if (s.overview) {
        structuredHTML += `
          <p><strong>Value Proposition:</strong> ${s.overview.valueProposition || 'N/A'}</p>
          <p><strong>Target Audience:</strong> ${s.overview.targetAudience || 'N/A'}</p>
          <p><strong>Monetization:</strong> ${s.overview.monetization || 'N/A'}</p>
        `;
      }
      
      if (s.market?.competitors?.length > 0) {
        structuredHTML += '<h3>Competitors</h3><ul>';
        s.market.competitors.forEach((comp: any) => {
          structuredHTML += `<li><strong>${comp.name}</strong>${comp.url ? ` - <a href="${comp.url}">${comp.url}</a>` : ''}${comp.notes ? `: ${comp.notes}` : ''}</li>`;
        });
        structuredHTML += '</ul>';
      }

      if (s.market?.swot) {
        structuredHTML += '<h3>SWOT Analysis</h3>';
        if (s.market.swot.strengths?.length > 0) {
          structuredHTML += '<h4>Strengths</h4><ul>';
          s.market.swot.strengths.forEach((item: string) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += '</ul>';
        }
        if (s.market.swot.weaknesses?.length > 0) {
          structuredHTML += '<h4>Weaknesses</h4><ul>';
          s.market.swot.weaknesses.forEach((item: string) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += '</ul>';
        }
        if (s.market.swot.opportunities?.length > 0) {
          structuredHTML += '<h4>Opportunities</h4><ul>';
          s.market.swot.opportunities.forEach((item: string) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += '</ul>';
        }
        if (s.market.swot.threats?.length > 0) {
          structuredHTML += '<h4>Threats</h4><ul>';
          s.market.swot.threats.forEach((item: string) => {
            structuredHTML += `<li>${item}</li>`;
          });
          structuredHTML += '</ul>';
        }
      }

      if (s.technical) {
        structuredHTML += '<h3>Technical Details</h3>';
        if (s.technical.techStack?.length > 0) {
          structuredHTML += `<p><strong>Tech Stack:</strong> ${s.technical.techStack.join(', ')}</p>`;
        }
        if (s.technical.uiColors?.length > 0) {
          structuredHTML += `<p><strong>UI Colors:</strong> ${s.technical.uiColors.join(', ')}</p>`;
        }
        if (s.technical.keyPages?.length > 0) {
          structuredHTML += '<p><strong>Key Pages:</strong></p><ul>';
          s.technical.keyPages.forEach((page: string) => {
            structuredHTML += `<li>${page}</li>`;
          });
          structuredHTML += '</ul>';
        }
      }
    }

    // Build improvements HTML
    let improvementsHTML = '';
    if (stage1.improvements) {
      if (stage1.improvements.twists?.length > 0) {
        improvementsHTML += '<h3>Business Improvement Twists</h3><ul>';
        stage1.improvements.twists.forEach((twist: string) => {
          improvementsHTML += `<li>${twist}</li>`;
        });
        improvementsHTML += '</ul>';
      }
      if (stage1.improvements.sevenDayPlan?.length > 0) {
        improvementsHTML += '<h3>7-Day Action Plan</h3>';
        stage1.improvements.sevenDayPlan.forEach((day: any) => {
          improvementsHTML += `<h4>Day ${day.day}</h4><ul>`;
          day.tasks.forEach((task: string) => {
            improvementsHTML += `<li>${task}</li>`;
          });
          improvementsHTML += '</ul>';
        });
      }
    }

    return `
  <div class="stage">
    <h2>Stage 1: ${stage1.name}</h2>
    
    <h3>Business Information</h3>
    <p><strong>URL:</strong> <a href="${stage1.url}">${stage1.url}</a></p>
    ${stage1.businessModel ? `<p><strong>Business Model:</strong> ${stage1.businessModel}</p>` : ''}
    ${stage1.revenueStream ? `<p><strong>Revenue Stream:</strong> ${stage1.revenueStream}</p>` : ''}
    ${stage1.targetMarket ? `<p><strong>Target Market:</strong> ${stage1.targetMarket}</p>` : ''}
    
    <h3>Summary</h3>
    <p>${stage1.summary}</p>
    
    ${stage1.overallScore ? `<div><span class="score-badge">Overall Score: ${stage1.overallScore}/10</span></div>` : ''}
    
    ${scoreDetailsHTML}
    ${aiInsightsHTML}
    ${structuredHTML}
    ${improvementsHTML}
  </div>`;
  }

  private formatCamelCase(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  private renderStage2HTML(stage2: any): string {
    return `
  <div class="stage">
    <h2>Stage 2: ${stage2.name}</h2>
    
    <div>
      <span class="score-badge">Effort: ${stage2.effortScore}/10</span>
      <span class="score-badge">Reward: ${stage2.rewardScore}/10</span>
    </div>

    <div class="recommendation ${stage2.recommendation}">
      <strong>Recommendation:</strong> ${stage2.recommendation.toUpperCase()}
    </div>

    <h3>Reasoning</h3>
    <p>${stage2.reasoning}</p>

    <h3>Automation Potential</h3>
    <p><strong>Score:</strong> ${Math.round(stage2.automationPotential.score * 100)}%</p>
    <ul>
      ${stage2.automationPotential.opportunities.map((opp: string) => `<li>${opp}</li>`).join('')}
    </ul>

    <h3>Resource Requirements</h3>
    <p><strong>Time:</strong> ${stage2.resourceRequirements.time}</p>
    <p><strong>Money:</strong> ${stage2.resourceRequirements.money}</p>
    <p><strong>Skills:</strong> ${stage2.resourceRequirements.skills.join(', ')}</p>

    <h3>Next Steps</h3>
    <ol>
      ${stage2.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
    </ol>
  </div>`;
  }

  private renderStage3HTML(stage3: any): string {
    return `
  <div class="stage">
    <h2>Stage 3: ${stage3.name}</h2>
    
    <h3>Core Features (MVP)</h3>
    <ul>
      ${stage3.coreFeatures.map((feature: string) => `<li>${feature}</li>`).join('')}
    </ul>

    <h3>Nice-to-Have Features</h3>
    <ul>
      ${stage3.niceToHaves.map((feature: string) => `<li>${feature}</li>`).join('')}
    </ul>

    <h3>Technology Stack</h3>
    <p><strong>Frontend:</strong> ${stage3.techStack.frontend.join(', ')}</p>
    <p><strong>Backend:</strong> ${stage3.techStack.backend.join(', ')}</p>
    <p><strong>Infrastructure:</strong> ${stage3.techStack.infrastructure.join(', ')}</p>

    <h3>Development Timeline</h3>
    ${stage3.timeline.map((phase: any) => `
      <div class="timeline-item">
        <h4>${phase.phase} (${phase.duration})</h4>
        <ul>
          ${phase.deliverables.map((d: string) => `<li>${d}</li>`).join('')}
        </ul>
      </div>
    `).join('')}

    <h3>Estimated Cost</h3>
    <p>${stage3.estimatedCost}</p>
  </div>`;
  }

  private renderStage4HTML(stage4: any): string {
    return `
  <div class="stage">
    <h2>Stage 4: ${stage4.name}</h2>
    
    <h3>Testing Methods</h3>
    ${stage4.testingMethods.map((method: any) => `
      <div style="margin: 20px 0;">
        <h4>${method.method}</h4>
        <p>${method.description}</p>
        <p><strong>Cost:</strong> ${method.cost} | <strong>Timeline:</strong> ${method.timeline}</p>
      </div>
    `).join('')}

    <h3>Success Metrics</h3>
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          <th>Target</th>
          <th>Measurement</th>
        </tr>
      </thead>
      <tbody>
        ${stage4.successMetrics.map((metric: any) => `
          <tr>
            <td>${metric.metric}</td>
            <td>${metric.target}</td>
            <td>${metric.measurement}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>Budget</h3>
    <p><strong>Total:</strong> ${stage4.budget.total}</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Cost</th>
        </tr>
      </thead>
      <tbody>
        ${stage4.budget.breakdown.map((item: any) => `
          <tr>
            <td>${item.item}</td>
            <td>${item.cost}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>Timeline</h3>
    <p>${stage4.timeline}</p>
  </div>`;
  }

  private renderStage5HTML(stage5: any): string {
    return `
  <div class="stage">
    <h2>Stage 5: ${stage5.name}</h2>
    
    <h3>Growth Channels</h3>
    ${stage5.growthChannels.map((channel: any) => `
      <div style="margin: 20px 0;">
        <h4>${channel.channel} <span class="priority-${channel.priority}">[${channel.priority.toUpperCase()}]</span></h4>
        <p>${channel.strategy}</p>
      </div>
    `).join('')}

    <h3>Growth Milestones</h3>
    ${stage5.milestones.map((milestone: any) => `
      <div class="timeline-item">
        <h4>${milestone.milestone} (${milestone.timeline})</h4>
        <ul>
          ${milestone.metrics.map((m: string) => `<li>${m}</li>`).join('')}
        </ul>
      </div>
    `).join('')}

    <h3>Resource Scaling Plan</h3>
    ${stage5.resourceScaling.map((phase: any) => `
      <div style="margin: 20px 0;">
        <h4>${phase.phase}</h4>
        <p><strong>Team:</strong> ${phase.team.join(', ')}</p>
        <p><strong>Infrastructure:</strong> ${phase.infrastructure}</p>
      </div>
    `).join('')}
  </div>`;
  }

  private renderStage6HTML(stage6: any): string {
    return `
  <div class="stage">
    <h2>Stage 6: ${stage6.name}</h2>
    
    <h3>Automation Opportunities</h3>
    <table>
      <thead>
        <tr>
          <th>Process</th>
          <th>Tool</th>
          <th>ROI</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        ${stage6.automationOpportunities.map((opp: any) => `
          <tr>
            <td>${opp.process}</td>
            <td>${opp.tool}</td>
            <td>${opp.roi}</td>
            <td>${opp.priority}/10</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3>Implementation Plan</h3>
    ${stage6.implementationPlan.map((phase: any) => `
      <div class="timeline-item">
        <h4>${phase.phase} (${phase.timeline})</h4>
        <ul>
          ${phase.automations.map((a: string) => `<li>${a}</li>`).join('')}
        </ul>
      </div>
    `).join('')}

    <h3>Estimated Savings</h3>
    <p>${stage6.estimatedSavings}</p>
  </div>`;
  }

  /**
   * Generate HTML export for business improvement plan
   */
  generateImprovementHTML(improvements: any, analysis: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Business Improvement Plan - ${analysis.businessModel || 'Business'}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f9fafb;
    }
    .header {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.5em;
    }
    .section {
      background: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .section h2 {
      color: #f59e0b;
      margin-top: 0;
      border-bottom: 2px solid #f59e0b;
      padding-bottom: 10px;
    }
    .twist {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .day-plan {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .day-plan h3 {
      color: #f59e0b;
      margin-top: 0;
    }
    .task {
      padding: 8px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .task:last-child {
      border-bottom: none;
    }
    .footer {
      text-align: center;
      margin-top: 50px;
      padding-top: 30px;
      border-top: 2px solid #e5e7eb;
      color: #6b7280;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Business Improvement Plan</h1>
    <div>${analysis.businessModel || 'Business Analysis'}</div>
    <div style="opacity: 0.9; margin-top: 10px;">
      <a href="${analysis.url}" style="color: white;">${analysis.url}</a>
    </div>
  </div>

  <div class="section">
    <h2>Three Ways to Improve This Business</h2>
    ${improvements.twists.map((twist: string, index: number) => `
      <div class="twist">
        <strong>${index + 1}.</strong> ${twist}
      </div>
    `).join('')}
  </div>

  <div class="section">
    <h2>7-Day Shipping Plan</h2>
    <p style="color: #6b7280; margin-bottom: 20px;">
      A focused action plan to ship a working prototype in one week
    </p>
    ${improvements.sevenDayPlan.map((day: any) => `
      <div class="day-plan">
        <h3>Day ${day.day}</h3>
        ${day.tasks.map((task: string) => `
          <div class="task">✓ ${task}</div>
        `).join('')}
      </div>
    `).join('')}
  </div>

  <div class="footer">
    <p>Generated by VentureClone AI</p>
    <p>Generated on ${new Date(improvements.generatedAt).toLocaleDateString()}</p>
  </div>
</body>
</html>`;
  }

  /**
   * Generate PDF export for business improvement plan
   */
  async generateImprovementPDF(improvements: any, analysis: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold')
        .text('Business Improvement Plan');
      doc.fontSize(16).font('Helvetica')
        .text(analysis.businessModel || 'Business Analysis');
      doc.fontSize(12)
        .text(analysis.url);
      doc.moveDown(2);

      // Three Ways to Improve
      doc.fontSize(18).font('Helvetica-Bold').fillColor('#f59e0b')
        .text('Three Ways to Improve This Business');
      doc.moveDown(1).fontSize(12).font('Helvetica').fillColor('#000');
      
      improvements.twists.forEach((twist: string, index: number) => {
        doc.moveDown(0.5)
          .font('Helvetica-Bold').text(`${index + 1}. `, { continued: true })
          .font('Helvetica').text(twist);
      });

      // 7-Day Plan
      doc.moveDown(2).fontSize(18).font('Helvetica-Bold').fillColor('#f59e0b')
        .text('7-Day Shipping Plan');
      doc.moveDown(0.5).fontSize(11).font('Helvetica').fillColor('#666')
        .text('A focused action plan to ship a working prototype in one week');
      doc.moveDown(1).fillColor('#000');

      improvements.sevenDayPlan.forEach((day: any) => {
        doc.moveDown(1).fontSize(14).font('Helvetica-Bold')
          .text(`Day ${day.day}`);
        doc.fontSize(12).font('Helvetica');
        day.tasks.forEach((task: string) => {
          doc.text(`✓ ${task}`);
        });
      });

      // Footer
      doc.moveDown(3).fontSize(10).fillColor('#666')
        .text('Generated by VentureClone AI', { align: 'center' })
        .text(`Generated on ${new Date(improvements.generatedAt).toLocaleDateString()}`, { align: 'center' });

      doc.end();
    });
  }
}

/**
 * Complete plan data structure
 */
export interface CompletePlanData {
  metadata: {
    businessName: string;
    url: string;
    generatedAt: string;
    analysisId: string;
  };
  stage1: {
    name: string;
    summary: string;
    url: string;
    overallScore?: number | undefined;
    structured?: any;
    scoreDetails?: any;
    aiInsights?: any;
    firstPartyData?: any;
    improvements?: any;
    businessModel?: string | undefined;
    revenueStream?: string | undefined;
    targetMarket?: string | undefined;
  };
  stage2?: ({
    name: string;
  } & Stage2Content) | undefined;
  stage3?: ({
    name: string;
  } & Stage3Content) | undefined;
  stage4?: ({
    name: string;
  } & Stage4Content) | undefined;
  stage5?: ({
    name: string;
  } & Stage5Content) | undefined;
  stage6?: ({
    name: string;
  } & Stage6Content) | undefined;
}
