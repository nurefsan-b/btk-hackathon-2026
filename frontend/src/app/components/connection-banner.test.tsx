import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ConnectionBanner } from './connection-banner';

describe('ConnectionBanner Component', () => {
    it('should not render anything when isOnline is true', () => {
        const { container } = render(<ConnectionBanner isOnline={true} />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render anything when isOnline is null', () => {
        const { container } = render(<ConnectionBanner isOnline={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('should render offline warning when isOnline is false', () => {
        render(<ConnectionBanner isOnline={false} />);
        expect(screen.getByText(/Backend bağlantısı kurulamadı/i)).toBeInTheDocument();
        expect(screen.getByText(/Demo veriler gösteriliyor/i)).toBeInTheDocument();
    });
});
