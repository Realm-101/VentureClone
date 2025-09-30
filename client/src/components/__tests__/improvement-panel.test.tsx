import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImprovementPanel } from '@/components/ui/improvement-panel';
import type { BusinessImprovement } from '@shared/schema';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

const mockImprovement: BusinessImprovement = {
  twists: [
    "Focus on mobile-first design with offline capabilities for better user experience",
    "Implement AI-powered personalization to increase user engagement by 40%",
    "Add subscription tiers with premium features to diversify revenue streams"
  ],
  sevenDayPlan: [
    {
      day: 1,
      tasks: [
        "Set up development environment and project structure",
        "Create wireframes for mobile-first design",
        "Research AI personalization APIs"
      ]
    },
    {
      day: 2,
      tasks: [
        "Implement basic user authentication system",
        "Create responsive landing page"
      ]
    },
    {
      day: 3,
      tasks: [
        "Build core functionality MVP",
        "Integrate basic AI recommendations",
        "Set up analytics tracking"
      ]
    },
    {
      day: 4,
      tasks: [
        "Implement subscription payment system",
        "Create user dashboard"
      ]
    },
    {
      day: 5,
      tasks: [
        "Add offline functionality",
        "Optimize mobile performance",
        "Create onboarding flow"
      ]
    },
    {
      day: 6,
      tasks: [
        "Implement advanced AI features",
        "Add premium tier functionality"
      ]
    },
    {
      day: 7,
      tasks: [
        "Final testing and bug fixes",
        "Deploy to production",
        "Launch marketing campaign"
      ]
    }
  ],
  generatedAt: "2024-01-15T10:30:00Z"
};

describe('ImprovementPanel', () => {
  it('renders improvement panel with all sections', () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    // Check main title
    expect(screen.getByText('Business Improvement Suggestions')).toBeInTheDocument();
    
    // Check improvement angles section
    expect(screen.getByText('Three Ways to Improve This Business')).toBeInTheDocument();
    
    // Check all three twists are displayed
    expect(screen.getByText(/Focus on mobile-first design/)).toBeInTheDocument();
    expect(screen.getByText(/Implement AI-powered personalization/)).toBeInTheDocument();
    expect(screen.getByText(/Add subscription tiers/)).toBeInTheDocument();
    
    // Check 7-day plan section
    expect(screen.getByText('7-Day Shipping Plan')).toBeInTheDocument();
    
    // Check copy plan button
    expect(screen.getByText('Copy Plan')).toBeInTheDocument();
  });

  it('displays all 7 days of the plan', () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    // Check all days are displayed
    for (let day = 1; day <= 7; day++) {
      expect(screen.getByText(`Day ${day}`)).toBeInTheDocument();
    }
  });

  it('displays correct number of tasks for each day', () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    // Day 1 should have 3 tasks
    const day1Section = screen.getByText('Day 1').closest('div');
    expect(day1Section).toHaveTextContent('3 tasks');
    
    // Day 2 should have 2 tasks
    const day2Section = screen.getByText('Day 2').closest('div');
    expect(day2Section).toHaveTextContent('2 tasks');
  });

  it('displays task count correctly for single task', () => {
    const singleTaskImprovement: BusinessImprovement = {
      ...mockImprovement,
      sevenDayPlan: [
        {
          day: 1,
          tasks: ["Single task"]
        }
      ]
    };
    
    render(<ImprovementPanel improvement={singleTaskImprovement} />);
    
    const day1Section = screen.getByText('Day 1').closest('div');
    expect(day1Section).toHaveTextContent('1 task');
  });

  it('copies plan to clipboard when copy button is clicked', async () => {
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText');
    
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    const copyButton = screen.getByText('Copy Plan');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(writeTextSpy).toHaveBeenCalledWith(
        expect.stringContaining('# 7-Day Business Improvement Plan')
      );
    });
    
    // Check that the copied text includes business twists
    const copiedText = writeTextSpy.mock.calls[0][0];
    expect(copiedText).toContain('## Business Improvement Angles');
    expect(copiedText).toContain('Focus on mobile-first design');
    
    // Check that the copied text includes daily tasks
    expect(copiedText).toContain('## Daily Action Plan');
    expect(copiedText).toContain('### Day 1');
    expect(copiedText).toContain('- [ ] Set up development environment');
  });

  it('shows success feedback when copy is successful', async () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    const copyButton = screen.getByText('Copy Plan');
    fireEvent.click(copyButton);
    
    // Should show "Copied!" temporarily
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
    
    // Should return to "Copy Plan" after timeout
    await waitFor(() => {
      expect(screen.getByText('Copy Plan')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles clipboard error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('Clipboard error'));
    
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    const copyButton = screen.getByText('Copy Plan');
    fireEvent.click(copyButton);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to copy plan:', expect.any(Error));
    });
    
    consoleSpy.mockRestore();
  });

  it('displays generation timestamp correctly', () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    // Should display formatted date and time
    expect(screen.getByText(/Generated on/)).toBeInTheDocument();
    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument(); // US date format
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <ImprovementPanel improvement={mockImprovement} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('displays improvement angles with correct numbering', () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    // Check that badges show correct numbers
    const badges = screen.getAllByText(/^[1-3]$/);
    expect(badges).toHaveLength(3);
    
    // Check specific numbering
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('displays all task content correctly', () => {
    render(<ImprovementPanel improvement={mockImprovement} />);
    
    // Check some specific tasks are displayed
    expect(screen.getByText('Set up development environment and project structure')).toBeInTheDocument();
    expect(screen.getByText('Create wireframes for mobile-first design')).toBeInTheDocument();
    expect(screen.getByText('Final testing and bug fixes')).toBeInTheDocument();
  });
});