import { useState, useEffect, useRef } from 'react';
import { Plus, LogOut, Calendar, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase, Task } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import EditTaskModal from './EditTaskModal';
import NotificationBanner from './NotificationBanner';
import { RecommendationsBar } from './RecommendationsBar';
import { FilterBar } from './FilterBar';
import { WeeklyPlanningModal } from './WeeklyPlanningModal';
import FeedbackModal from './FeedbackModal';
import { loadTasksWithRelations, checkPlanningStatus, TaskWithRelations } from '../utils/taskHelpers';
import { Balloons } from './Balloons';

export default function EisenhowerMatrix() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuadrant, setSelectedQuadrant] = useState<{ urgent: boolean; important: boolean } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([]);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showPlanningPrompt, setShowPlanningPrompt] = useState(false);
  const [planningModalStep, setPlanningModalStep] = useState(1);
  const [returnToPlanningAfterTask, setReturnToPlanningAfterTask] = useState(false);
  const [showBalloons, setShowBalloons] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [activeQuadrantIndex, setActiveQuadrantIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (user) {
      loadTasks();
      checkPlanning();
    }
  }, [user]);

  async function checkPlanning() {
    try {
      const hasPlanned = await checkPlanningStatus();
      setShowPlanningPrompt(!hasPlanned);
    } catch (error) {
      console.error('Error checking planning status:', error);
    }
  }

  const loadTasks = async () => {
    try {
      const tasksWithRelations = await loadTasksWithRelations();
      setTasks(tasksWithRelations);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (title: string, description: string, isUrgent: boolean, isImportant: boolean, dueDate: string | null, roleIds: string[], goalIds: string[]) => {
    if (!user) return;

    try {
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert([{
          user_id: user.id,
          title,
          description,
          is_urgent: isUrgent,
          is_important: isImportant,
          due_date: dueDate,
        }])
        .select()
        .single();

      if (taskError) throw taskError;
      if (!task) throw new Error('Task creation failed');

      if (roleIds.length > 0) {
        const roleResults = await Promise.all(
          roleIds.map(roleId =>
            supabase.from('task_roles').insert({ task_id: task.id, role_id: roleId })
          )
        );

        const failedRoles = roleResults.filter(r => r.error);
        if (failedRoles.length > 0) {
          console.error('Some role assignments failed:', failedRoles);
        }
      }

      if (goalIds.length > 0) {
        const goalResults = await Promise.all(
          goalIds.map(goalId =>
            supabase.from('task_goals').insert({ task_id: task.id, goal_id: goalId })
          )
        );

        const failedGoals = goalResults.filter(r => r.error);
        if (failedGoals.length > 0) {
          console.error('Some goal assignments failed:', failedGoals);
        }
      }

      await loadTasks();

      if (returnToPlanningAfterTask) {
        setReturnToPlanningAfterTask(false);
        setPlanningModalStep(2);
        setShowPlanningModal(true);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (!confirm(`Delete task "${task.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const toggleTaskComplete = async (id: string, completed: boolean) => {
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('tasks')
        .update({
          completed,
          completed_at: completed ? now : null,
          updated_at: now
        })
        .eq('id', id);

      if (error) throw error;
      setTasks(tasks.map(task =>
        task.id === id ? { ...task, completed, completed_at: completed ? now : null } : task
      ));

      if (completed) {
        setShowBalloons(true);
        setTimeout(() => setShowBalloons(false), 4000);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const updateTask = async (id: string, title: string, description: string, isUrgent: boolean, isImportant: boolean, dueDate: string | null, roleIds: string[], goalIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title,
          description,
          is_urgent: isUrgent,
          is_important: isImportant,
          due_date: dueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const { error: deleteRolesError } = await supabase.from('task_roles').delete().eq('task_id', id);
      if (deleteRolesError) console.error('Error deleting old roles:', deleteRolesError);

      const { error: deleteGoalsError } = await supabase.from('task_goals').delete().eq('task_id', id);
      if (deleteGoalsError) console.error('Error deleting old goals:', deleteGoalsError);

      if (roleIds.length > 0) {
        const roleResults = await Promise.all(
          roleIds.map(roleId =>
            supabase.from('task_roles').insert({ task_id: id, role_id: roleId })
          )
        );
        const failedRoles = roleResults.filter(r => r.error);
        if (failedRoles.length > 0) {
          console.error('Some role assignments failed:', failedRoles);
        }
      }

      if (goalIds.length > 0) {
        const goalResults = await Promise.all(
          goalIds.map(goalId =>
            supabase.from('task_goals').insert({ task_id: id, goal_id: goalId })
          )
        );
        const failedGoals = goalResults.filter(r => r.error);
        if (failedGoals.length > 0) {
          console.error('Some goal assignments failed:', failedGoals);
        }
      }

      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again.');
    }
  };

  const openEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsEditModalOpen(true);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const openModal = (urgent: boolean, important: boolean) => {
    setSelectedQuadrant({ urgent, important });
    setIsModalOpen(true);
  };

  const getTasksForQuadrant = (urgent: boolean, important: boolean) => {
    return tasks.filter(task => {
      if (task.is_urgent !== urgent || task.is_important !== important) return false;

      if (selectedRoleIds.length > 0) {
        const taskRoleIds = task.roles.map(r => r.id);
        if (!selectedRoleIds.some(id => taskRoleIds.includes(id))) return false;
      }

      if (selectedGoalIds.length > 0) {
        const taskGoalIds = task.goals.map(g => g.id);
        if (!selectedGoalIds.some(id => taskGoalIds.includes(id))) return false;
      }

      return true;
    });
  };

  async function dismissPlanningReminder() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dismissed_planning_until: tomorrow.toISOString().split('T')[0],
          planning_reminder_enabled: true,
          onboarding_completed: true,
        }, {
          onConflict: 'user_id',
        });

      setShowPlanningPrompt(false);
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  }

  const quadrants = [
    {
      urgent: true,
      important: true,
      title: 'Q1 - Do First',
      subtitle: 'Urgent & Important',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      borderColor: 'border-red-200',
      headerColor: 'bg-red-600',
      buttonColor: 'bg-red-600 hover:bg-red-700'
    },
    {
      urgent: false,
      important: true,
      title: 'Q2 - Schedule',
      subtitle: 'Not Urgent & Important',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      headerColor: 'bg-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      urgent: true,
      important: false,
      title: 'Q3 - Delegate',
      subtitle: 'Urgent & Not Important',
      bgColor: 'bg-gradient-to-br from-amber-50 to-amber-100',
      borderColor: 'border-amber-200',
      headerColor: 'bg-amber-600',
      buttonColor: 'bg-amber-600 hover:bg-amber-700'
    },
    {
      urgent: false,
      important: false,
      title: 'Q4 - Eliminate',
      subtitle: 'Not Urgent & Not Important',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      headerColor: 'bg-gray-600',
      buttonColor: 'bg-gray-600 hover:bg-gray-700'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {showBalloons && <Balloons />}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">Quadrant Life</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Intentional planning for a balanced, productive life
              <a
                href="https://en.wikipedia.org/wiki/First_Things_First_(book)"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 ml-2 text-blue-600 hover:text-blue-700 transition-colors"
                aria-label="Learn about First Things First and the Eisenhower Matrix"
              >
                <span className="text-xs sm:text-sm underline">Learn about the Eisenhower Matrix</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterBar
              selectedRoleIds={selectedRoleIds}
              selectedGoalIds={selectedGoalIds}
              onRoleFilterChange={setSelectedRoleIds}
              onGoalFilterChange={setSelectedGoalIds}
            />
            <button
              onClick={() => setShowPlanningModal(true)}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex-shrink-0"
              title="Quick Review"
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline text-sm sm:text-base">Quick Review</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm sm:text-base">Sign Out</span>
            </button>
          </div>
        </div>

        {showPlanningPrompt && (
          <div className="mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-start gap-4">
              <Calendar className="w-8 h-8 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Quick Review</h3>
                <p className="text-blue-50 leading-relaxed mb-4">
                  Take 10 minutes to review your tasks and set Quadrant 2 priorities for this week. Balance your roles and align with your goals.{' '}
                  <a
                    href="https://www.franklincovey.com/habit-3/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-white hover:text-blue-100 transition-colors underline"
                  >
                    <span className="text-sm">Learn about putting first things first</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowPlanningModal(true);
                      setShowPlanningPrompt(false);
                    }}
                    className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
                  >
                    Start Planning
                  </button>
                  <button
                    onClick={dismissPlanningReminder}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition border border-white"
                  >
                    Remind Tomorrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <NotificationBanner
          tasks={tasks}
          onTaskClick={openEditModal}
        />

        <RecommendationsBar tasks={tasks} />

        <div className="flex md:hidden items-center gap-2 mt-6 overflow-x-auto pb-1" role="tablist" aria-label="Select quadrant">
          {quadrants.map((quadrant, index) => (
            <button
              key={`${quadrant.urgent}-${quadrant.important}`}
              role="tab"
              aria-selected={activeQuadrantIndex === index}
              onClick={() => setActiveQuadrantIndex(index)}
              className={`flex-1 min-w-[80px] px-2 py-2 rounded-lg text-xs font-semibold transition touch-manipulation ${
                activeQuadrantIndex === index
                  ? `${quadrant.headerColor} text-white shadow-sm`
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {quadrant.title.split(' - ')[0]}
            </button>
          ))}
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-3 md:mt-6"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            const SWIPE_THRESHOLD = 50;
            if (deltaX > SWIPE_THRESHOLD) {
              setActiveQuadrantIndex((prev) => Math.max(prev - 1, 0));
            } else if (deltaX < -SWIPE_THRESHOLD) {
              setActiveQuadrantIndex((prev) => Math.min(prev + 1, quadrants.length - 1));
            }
            touchStartX.current = null;
          }}
        >
          {quadrants.map((quadrant, index) => {
            const quadrantTasks = getTasksForQuadrant(quadrant.urgent, quadrant.important);

            return (
              <div
                key={`${quadrant.urgent}-${quadrant.important}`}
                className={`${quadrant.bgColor} ${quadrant.borderColor} border-2 rounded-xl overflow-hidden ${
                  index === activeQuadrantIndex ? 'block' : 'hidden'
                } md:block`}
              >
                <div className={`${quadrant.headerColor} text-white p-3 sm:p-4`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg sm:text-xl font-bold truncate">{quadrant.title}</h2>
                      <p className="text-xs sm:text-sm opacity-90 truncate">{quadrant.subtitle}</p>
                    </div>
                    <button
                      onClick={() => openModal(quadrant.urgent, quadrant.important)}
                      className={`${quadrant.buttonColor} p-2 rounded-lg transition flex-shrink-0`}
                      aria-label={`Add task to ${quadrant.title} quadrant`}
                    >
                      <Plus className="w-5 h-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 min-h-[250px] sm:min-h-[300px]">
                  {quadrantTasks.length === 0 ? (
                    <div className="text-center text-sm sm:text-base text-gray-500 py-8">
                      {(selectedRoleIds.length > 0 || selectedGoalIds.length > 0)
                        ? 'No tasks match your filters.'
                        : 'No tasks yet. Click + to add one.'}
                    </div>
                  ) : (
                    quadrantTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDelete={deleteTask}
                        onToggleComplete={toggleTaskComplete}
                        onEdit={openEditModal}
                        roles={task.roles}
                        goals={task.goals}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addTask}
        quadrant={selectedQuadrant}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={updateTask}
        task={taskToEdit}
      />

      <WeeklyPlanningModal
        isOpen={showPlanningModal}
        onClose={() => {
          setShowPlanningModal(false);
          setPlanningModalStep(1);
        }}
        onComplete={() => {
          setShowPlanningPrompt(false);
          setPlanningModalStep(1);
          loadTasks();
        }}
        onCreateTask={() => {
          setReturnToPlanningAfterTask(true);
          setSelectedQuadrant({ urgent: false, important: true });
          setIsModalOpen(true);
        }}
        initialStep={planningModalStep}
      />

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setIsFeedbackModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition shadow-sm"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Send Feedback</span>
        </button>
      </div>

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  );
}
