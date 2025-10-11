import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EstimatesCard } from '../estimates-card';
import type { TimeAndCostEstimates } from '../../types/insights';

describe('EstimatesCard', () => {
  const mockEstimates: TimeAndCostEstimates = {
    developmentTime: { min: 3, max: 6 },
    oneTimeCost: { min: 5000, max: 15000 },
    monthlyCost: { min: 50, max: 200 },
  };

  it('renders with valid estimates data', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    expect(screen.getByText('Time & Cost Estimates')).toBeInTheDocument();
  });

  it('displays development time range', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    expect(screen.getByText('Development Time')).toBeInTheDocument();
    expect(screen.getByText('3-6 months')).toBeInTheDocument();
  });

  it('displays one-time cost range', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    expect(screen.getByText('One-Time Cost')).toBeInTheDocument();
    expect(screen.getByText('$5,000 - $15,000')).toBeInTheDocument();
  });

  it('displays monthly cost range', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    expect(screen.getByText('Monthly Cost')).toBeInTheDocument();
    expect(screen.getByText('$50 - $200/mo')).toBeInTheDocument();
  });

  it('calculates and displays average development time', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    // Average of 3-6 is 4.5 months
    expect(screen.getByText(/4.5 months average/i)).toBeInTheDocument();
  });

  it('calculates and displays average one-time cost', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    // Average of 5000-15000 is 10000
    expect(screen.getByText(/\$10,000 average/i)).toBeInTheDocument();
  });

  it('calculates and displays average monthly cost', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    // Average of 50-200 is 125
    expect(screen.getByText(/\$125\/mo average/i)).toBeInTheDocument();
  });

  it('displays first year total cost', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    expect(screen.getByText('First Year Total')).toBeInTheDocument();
    // Min: 5000 + (50 * 12) = 5600
    // Max: 15000 + (200 * 12) = 17400
    expect(screen.getByText('$5,600 - $17,400')).toBeInTheDocument();
  });

  it('handles zero monthly costs', () => {
    const zeroMonthlyCost: TimeAndCostEstimates = {
      developmentTime: { min: 2, max: 4 },
      oneTimeCost: { min: 3000, max: 8000 },
      monthlyCost: { min: 0, max: 0 },
    };
    
    render(<EstimatesCard estimates={zeroMonthlyCost} />);
    
    expect(screen.getByText('$0 - $0/mo')).toBeInTheDocument();
    // First year total should equal one-time cost
    expect(screen.getByText('$3,000 - $8,000')).toBeInTheDocument();
  });

  it('handles large cost ranges', () => {
    const largeCosts: TimeAndCostEstimates = {
      developmentTime: { min: 12, max: 24 },
      oneTimeCost: { min: 50000, max: 150000 },
      monthlyCost: { min: 1000, max: 5000 },
    };
    
    render(<EstimatesCard estimates={largeCosts} />);
    
    expect(screen.getByText('12-24 months')).toBeInTheDocument();
    expect(screen.getByText('$50,000 - $150,000')).toBeInTheDocument();
    expect(screen.getByText('$1,000 - $5,000/mo')).toBeInTheDocument();
  });

  it('handles small time ranges', () => {
    const smallTime: TimeAndCostEstimates = {
      developmentTime: { min: 0.5, max: 1 },
      oneTimeCost: { min: 1000, max: 3000 },
      monthlyCost: { min: 10, max: 50 },
    };
    
    render(<EstimatesCard estimates={smallTime} />);
    
    expect(screen.getByText('0.5-1 months')).toBeInTheDocument();
  });

  it('displays assumptions text', () => {
    render(<EstimatesCard estimates={mockEstimates} />);
    
    expect(screen.getByText(/Assumes solo developer working part-time/i)).toBeInTheDocument();
  });

  it('formats currency with commas', () => {
    const largeCosts: TimeAndCostEstimates = {
      developmentTime: { min: 6, max: 12 },
      oneTimeCost: { min: 25000, max: 75000 },
      monthlyCost: { min: 500, max: 1500 },
    };
    
    render(<EstimatesCard estimates={largeCosts} />);
    
    expect(screen.getByText('$25,000 - $75,000')).toBeInTheDocument();
  });

  it('handles equal min and max values', () => {
    const equalValues: TimeAndCostEstimates = {
      developmentTime: { min: 4, max: 4 },
      oneTimeCost: { min: 10000, max: 10000 },
      monthlyCost: { min: 100, max: 100 },
    };
    
    render(<EstimatesCard estimates={equalValues} />);
    
    expect(screen.getByText('4-4 months')).toBeInTheDocument();
    expect(screen.getByText('$10,000 - $10,000')).toBeInTheDocument();
    expect(screen.getByText('$100 - $100/mo')).toBeInTheDocument();
  });
});
