/**
 * Consent Flow Test Suite
 *
 * Example tests showing how to test consent flow with MSW
 * Run with: pnpm test
 */

import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from '../../__tests__/setup/global-setup';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For toBeInTheDocument
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConsentModal } from './ConsentModal';

// Mock session context
const mockSessionId = 'session-test-123';

describe('Consent Flow', () => {
  // MSW server setup
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('shows consent modal when no consent exists', async () => {
    renderWithProviders(
      <ConsentModal
        open={true}
        setOpen={() => {}}
        onSuccess={() => {}}
        stepData={{
          consent_purpose_id: '660e8400-e29b-41d4-a716-446655440006',
          page: '/index',
        }}
      />
    );

    // MSW mocks will return consent version data
    // Modal should be visible with consent content
    await waitFor(() => {
      expect(screen.getByText(/consent.*terms/i)).toBeInTheDocument();
    });
  });

  it('handles consent grant successfully', async () => {
    const onSuccess = vi.fn();

    renderWithProviders(
      <ConsentModal
        open={true}
        setOpen={() => {}}
        onSuccess={onSuccess}
        stepData={{
          consent_purpose_id: '660e8400-e29b-41d4-a716-446655440006',
          page: '/index',
        }}
      />
    );

    // Click agree button
    const agreeButton = screen.getByRole('button', { name: /agree/i });
    fireEvent.click(agreeButton);

    // MSW mocks will handle the consent creation
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('handles consent rejection', async () => {
    const setOpen = vi.fn();

    renderWithProviders(
      <ConsentModal
        open={true}
        setOpen={setOpen}
        onSuccess={() => {}}
        stepData={{
          consent_purpose_id: '660e8400-e29b-41d4-a716-446655440006',
          page: '/index',
        }}
      />
    );

    // Click reject button
    const rejectButton = screen.getByRole('button', { name: /reject/i });
    fireEvent.click(rejectButton);

    // Modal should close
    expect(setOpen).toHaveBeenCalledWith(false);
  });
});
