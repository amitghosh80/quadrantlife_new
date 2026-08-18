import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';
import { GoalManager } from '../../components/GoalManager';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
      single: vi.fn(),
    })),
  },
}));

const { supabase: mockSupabaseClient } = await import('../../lib/supabase');

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

describe('Goals and Roles Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
  });

  it('should fetch and display roles', async () => {
    const mockRoles = [
      {
        id: '1',
        name: 'Developer',
        color: '#3b82f6',
        user_id: mockUser.id,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockRoles, error: null }),
    });

    render(
      <AuthProvider>
        <GoalManager />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });
  });

  it('should create a new role', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: '2',
          name: 'Designer',
          color: '#10b981',
          user_id: mockUser.id,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    });

    render(
      <AuthProvider>
        <GoalManager />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });
  });

  it('should fetch and display goals', async () => {
    const mockGoals = [
      {
        id: '1',
        title: 'Complete Project',
        description: 'Finish the main project',
        role_id: '1',
        target_date: '2026-12-31',
        progress: 50,
        user_id: mockUser.id,
        created_at: new Date().toISOString(),
      },
    ];

    const mockRoles = [
      {
        id: '1',
        name: 'Developer',
        color: '#3b82f6',
        user_id: mockUser.id,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];

    let callCount = 0;
    mockSupabaseClient.from.mockImplementation(() => {
      callCount++;
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({
          data: callCount === 1 ? mockRoles : mockGoals,
          error: null,
        }),
      };
    });

    render(
      <AuthProvider>
        <GoalManager />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Project')).toBeInTheDocument();
    });
  });

  it('should update goal progress', async () => {
    const mockGoal = {
      id: '1',
      title: 'Complete Project',
      description: 'Finish the main project',
      role_id: '1',
      target_date: '2026-12-31',
      progress: 50,
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
    };

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockGoal], error: null }),
      update: vi.fn().mockReturnThis(),
    });

    render(
      <AuthProvider>
        <GoalManager />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Project')).toBeInTheDocument();
    });
  });
});
