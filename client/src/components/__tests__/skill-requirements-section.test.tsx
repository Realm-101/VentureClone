import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SkillRequirementsSection } from '../skill-requirements-section';
import type { SkillRequirement } from '../../types/insights';

describe('SkillRequirementsSection', () => {
  const mockSkills: SkillRequirement[] = [
    {
      skill: 'React Development',
      category: 'frontend',
      proficiency: 'intermediate',
      priority: 'critical',
      learningResources: [
        {
          title: 'React Official Tutorial',
          url: 'https://react.dev/learn',
          type: 'documentation',
          difficulty: 'beginner',
        },
        {
          title: 'React Course',
          url: 'https://example.com/react',
          type: 'course',
          difficulty: 'intermediate',
        },
      ],
      relatedTechnologies: ['React', 'TypeScript', 'Vite'],
    },
    {
      skill: 'Node.js Backend',
      category: 'backend',
      proficiency: 'advanced',
      priority: 'critical',
      learningResources: [
        {
          title: 'Node.js Docs',
          url: 'https://nodejs.org/docs',
          type: 'documentation',
          difficulty: 'intermediate',
        },
      ],
      relatedTechnologies: ['Node.js', 'Express', 'PostgreSQL'],
    },
    {
      skill: 'Docker & Containers',
      category: 'infrastructure',
      proficiency: 'intermediate',
      priority: 'important',
      learningResources: [
        {
          title: 'Docker Tutorial',
          url: 'https://docker.com/tutorial',
          type: 'tutorial',
          difficulty: 'beginner',
        },
      ],
      relatedTechnologies: ['Docker', 'Kubernetes'],
    },
    {
      skill: 'UI/UX Design',
      category: 'design',
      proficiency: 'beginner',
      priority: 'nice-to-have',
      learningResources: [
        {
          title: 'Design Basics',
          url: 'https://example.com/design',
          type: 'video',
          difficulty: 'beginner',
        },
      ],
      relatedTechnologies: ['Figma', 'Tailwind CSS'],
    },
  ];

  it('renders with valid skills data', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getByText('Required Skills')).toBeInTheDocument();
  });

  it('displays all skills', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getByText('React Development')).toBeInTheDocument();
    expect(screen.getByText('Node.js Backend')).toBeInTheDocument();
    expect(screen.getByText('Docker & Containers')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
  });

  it('groups skills by category', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('displays proficiency levels', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
    expect(screen.getByText('Beginner')).toBeInTheDocument();
  });

  it('displays priority badges', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const criticalBadges = screen.getAllByText('Critical');
    expect(criticalBadges).toHaveLength(2);
    
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Nice to Have')).toBeInTheDocument();
  });

  it('expands to show learning resources', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const reactSkill = screen.getByText('React Development');
    fireEvent.click(reactSkill);
    
    expect(screen.getByText('React Official Tutorial')).toBeInTheDocument();
    expect(screen.getByText('React Course')).toBeInTheDocument();
  });

  it('shows related technologies when expanded', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const reactSkill = screen.getByText('React Development');
    fireEvent.click(reactSkill);
    
    expect(screen.getByText(/React, TypeScript, Vite/)).toBeInTheDocument();
  });

  it('displays learning resource types', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const reactSkill = screen.getByText('React Development');
    fireEvent.click(reactSkill);
    
    expect(screen.getByText(/documentation/i)).toBeInTheDocument();
    expect(screen.getByText(/course/i)).toBeInTheDocument();
  });

  it('handles empty skills array', () => {
    render(<SkillRequirementsSection skills={[]} />);
    
    expect(screen.getByText('Required Skills')).toBeInTheDocument();
    expect(screen.getByText('No skill requirements available')).toBeInTheDocument();
  });

  it('handles skills with single learning resource', () => {
    const singleResource: SkillRequirement[] = [
      {
        skill: 'Single Resource Skill',
        category: 'frontend',
        proficiency: 'beginner',
        priority: 'important',
        learningResources: [
          {
            title: 'Single Resource',
            url: 'https://example.com',
            type: 'tutorial',
            difficulty: 'beginner',
          },
        ],
        relatedTechnologies: ['Tech1'],
      },
    ];
    
    render(<SkillRequirementsSection skills={singleResource} />);
    
    const skill = screen.getByText('Single Resource Skill');
    fireEvent.click(skill);
    
    expect(screen.getByText('Single Resource')).toBeInTheDocument();
  });

  it('handles skills with no learning resources', () => {
    const noResources: SkillRequirement[] = [
      {
        skill: 'No Resources Skill',
        category: 'backend',
        proficiency: 'intermediate',
        priority: 'critical',
        learningResources: [],
        relatedTechnologies: ['Tech1', 'Tech2'],
      },
    ];
    
    render(<SkillRequirementsSection skills={noResources} />);
    
    const skill = screen.getByText('No Resources Skill');
    fireEvent.click(skill);
    
    expect(screen.getByText(/No learning resources available/i)).toBeInTheDocument();
  });

  it('displays multiple related technologies', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const nodeSkill = screen.getByText('Node.js Backend');
    fireEvent.click(nodeSkill);
    
    expect(screen.getByText(/Node.js, Express, PostgreSQL/)).toBeInTheDocument();
  });

  it('highlights critical skills', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const criticalBadges = screen.getAllByText('Critical');
    expect(criticalBadges.length).toBeGreaterThan(0);
  });

  it('renders external links for learning resources', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const reactSkill = screen.getByText('React Development');
    fireEvent.click(reactSkill);
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('displays resource difficulty levels', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const reactSkill = screen.getByText('React Development');
    fireEvent.click(reactSkill);
    
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument();
  });

  it('handles all proficiency levels', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getByText('Beginner')).toBeInTheDocument();
    expect(screen.getByText('Intermediate')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('handles all priority levels', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Nice to Have')).toBeInTheDocument();
  });

  it('handles all category types', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    expect(screen.getByText('Frontend')).toBeInTheDocument();
    expect(screen.getByText('Backend')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
  });

  it('displays video resource type', () => {
    render(<SkillRequirementsSection skills={mockSkills} />);
    
    const designSkill = screen.getByText('UI/UX Design');
    fireEvent.click(designSkill);
    
    expect(screen.getByText(/video/i)).toBeInTheDocument();
  });
});
