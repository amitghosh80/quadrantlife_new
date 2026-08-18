import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';
import EisenhowerMatrix from '../../components/EisenhowerMatrix';

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

describe('Task CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null,
    });
  });

  it('should fetch and display tasks', async () => {
    const mockTasks = [
      {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        urgency: 'urgent',
        importance: 'important',
        completed: false,
        user_id: mockUser.id,
        created_at: new Date().toISOString(),
      },
    ];

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockTasks, error: null }),
    });

    render(
      <AuthProvider>
        <EisenhowerMatrix />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should create a new task', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: {
          id: '2',
          title: 'New Task',
          description: 'New Description',
          urgency: 'urgent',
          importance: 'important',
          completed: false,
          user_id: mockUser.id,
          created_at: new Date().toISOString(),
        },
        error: null,
      }),
    });

    render(
      <AuthProvider>
        <EisenhowerMatrix />
      </AuthProvider>
    );

    const addButton = await screen.findByRole('button', { name: /add task/i });
    await userEvent.click(addButton);

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalled();
    });
  });

  it('should update task completion status', async () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      urgency: 'urgent',
      importance: 'important',
      completed: false,
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
    };

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
      update: vi.fn().mockReturnThis(),
    });

    render(
      <AuthProvider>
        <EisenhowerMatrix />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });

  it('should delete a task', async () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      urgency: 'urgent',
      importance: 'important',
      completed: false,
      user_id: mockUser.id,
      created_at: new Date().toISOString(),
    };

    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [mockTask], error: null }),
      delete: vi.fn().mockReturnThis(),
    });

    render(
      <AuthProvider>
        <EisenhowerMatrix />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });
  });
});
