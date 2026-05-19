import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SavingsPoolCard } from './savings-pool-card';

describe('SavingsPoolCard Component', () => {
    it('should render the correct total savings amount', () => {
        render(<SavingsPoolCard totalSavings={150.55} />);
        // Checking for the large text display and the pending box display
        expect(screen.getAllByText(/₺150.55/).length).toBeGreaterThan(0);
        
        // Invested defaults to 0
        expect(screen.getByText(/₺0.00/)).toBeInTheDocument();
    });

    it('should render total invested and calculate all time correctly', () => {
        render(<SavingsPoolCard totalSavings={100} totalInvested={50} />);
        
        expect(screen.getAllByText(/₺100.00/).length).toBeGreaterThan(0); // Pending
        expect(screen.getByText(/₺50.00/)).toBeInTheDocument(); // Invested
        expect(screen.getByText(/₺150.00/)).toBeInTheDocument(); // All Time
    });
});
