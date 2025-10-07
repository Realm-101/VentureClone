import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../dropdown-menu';

describe('DropdownMenu', () => {
  it('should be closed by default', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should open when trigger is clicked', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should close when trigger is clicked again', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    
    // Open
    fireEvent.click(trigger);
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    // Close
    fireEvent.click(trigger);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should close when clicking outside', () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should close after selecting an item', () => {
    const handleClick = vi.fn();
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleClick}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);
    
    const item = screen.getByText('Item 1');
    fireEvent.click(item);

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('should support multiple items', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
          <DropdownMenuItem>Item 3</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByText('Open Menu');
    fireEvent.click(trigger);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    expect(screen.getByText('Item 3')).toBeInTheDocument();
  });
});
