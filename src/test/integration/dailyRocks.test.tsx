import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BigRocksModal from '../../components/BigRocksModal';
import TodayRocksBar from '../../components/TodayRocksBar';

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn(),
    })),
  },
}));

vi.mock('../../utils/dailyRocks', () => ({
  loadTodayRocks: vi.fn(),
  saveTodayRocks: vi.fn(),
  getLocalDateStr: vi.fn(() => '2026-09-20'),
}));

const { supabase: mockSupabaseClient } = await import('../../lib/supabase');
const dailyRocks = (await import('../../utils/dailyRocks')) as unknown as {
  loadTodayRocks: ReturnType<typeof vi.fn>;
  saveTodayRocks: ReturnType<typeof vi.fn>;
};

const mockUser = { id: 'the-user', email: 'test@example.com' };

const q2Task = {
  id: 'task-1',
  user_id: mockUser.id,
  title: 'Write quarterly review',
  description: '',
  is_urgent: false,
  is_important: true,
  completed: false,
  completed_at: null,
  due_date: null,
  created_at: '2026-09-20T00:00:00.000Z',
  updated_at: '2026-09-20T00:00:00.000Z',
};

describe('Big Rocks Daily Ritual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (mockSupabaseClient.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    dailyRocks.loadTodayRocks.mockResolvedValue([]);
    dailyRocks.saveTodayRocks.mockResolvedValue(undefined);
  });

  it('lets the user pick a Q2 task and plan the day', async () => {
    (mockSupabaseClient.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [q2Task], error: null }),
    });

    const onComplete = vi.fn();
    const onClose = vi.fn();

    render(
      <BigRocksModal isOpen={true} onClose={onClose} onComplete={onComplete} />
    );

    const toggleButton = await screen.findByLabelText('Toggle Write quarterly review as a rock');
    await userEvent.click(toggleButton);

    const planButton = screen.getByRole('button', { name: 'Plan My Day' });
    expect(planButton).not.toBeDisabled();
    await userEvent.click(planButton);

    await waitFor(() => {
      expect(dailyRocks.saveTodayRocks).toHaveBeenCalledWith(mockUser.id, ['task-1']);
      expect(onComplete).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders today\'s rocks and toggles completion', async () => {
    const rock = {
      id: 'rock-1',
      daily_plan_id: 'plan-1',
      task_id: 'task-1',
      sort_order: 0,
      completed_at: null,
      created_at: '2026-09-20T00:00:00.000Z',
      task: q2Task,
    };

    const onToggleComplete = vi.fn();
    const onRemove = vi.fn();

    render(
      <TodayRocksBar
        rocks={[rock]}
        hasPlan={true}
        onToggleComplete={onToggleComplete}
        onRemove={onRemove}
        onEdit={vi.fn()}
      />
    );

    expect(screen.getByText("Today's Big Rocks")).toBeInTheDocument();
    expect(screen.getByText('Write quarterly review')).toBeInTheDocument();

    await userEvent.click(screen.getByTitle('Mark rock complete'));
    expect(onToggleComplete).toHaveBeenCalledWith(rock, true);
  });
});