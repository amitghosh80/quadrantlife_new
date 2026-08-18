import { useState } from 'react';
import { AlertCircle, TrendingUp, CheckCircle, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task } from '../lib/supabase';

interface RecommendationsBarProps {
  tasks: Task[];
}

const dailyTips = [
  "Focus on Quadrant II (Schedule) to prevent crises. Most important work happens here.",
  "Urgent tasks demand attention, but important tasks deserve attention. Know the difference.",
  "The key is not to prioritize your schedule, but to schedule your priorities.",
  "Quadrant I (Do First) should be for genuine crises, not poor planning.",
  "Time spent in Quadrant II reduces time spent in Quadrant I crises.",
  "Delegate effectively: Quadrant III tasks can often be handled by others.",
  "Eliminate ruthlessly: Quadrant IV activities are time wasters that drain your energy.",
  "Prevention is better than firefighting. Invest time in planning and preparation.",
  "Most urgent things are not important, and most important things are not urgent.",
  "Your most important work rarely demands immediate action.",
  "Saying no to Quadrant III and IV creates space for Quadrant II excellence.",
  "Discipline yourself to spend more time in Quadrant II, even when it's not urgent.",
  "Balance is key: You can't eliminate all Quadrant I, but you can minimize it.",
  "The matrix is a tool for thinking, not just organizing. Reflect on your choices.",
  "Review your tasks weekly: Are you spending time where it matters most?"
];

const getDayOfYear = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getTaskSpecificInsights = (tasks: Task[]): string[] => {
  const insights: string[] = [];
  const taskTexts = tasks.map(t => `${t.title} ${t.description || ''}`.toLowerCase());

  const patterns = [
    { keywords: ['social media', 'facebook', 'instagram', 'twitter', 'tiktok', 'scroll'], insight: 'Use app blockers like Freedom or set specific time windows for social media (e.g., 15 min at lunch only).' },
    { keywords: ['exercise', 'workout', 'gym', 'fitness', 'run'], insight: 'Schedule workouts like appointments. Start small: 10 minutes daily beats sporadic intense sessions.' },
    { keywords: ['read', 'book', 'reading'], insight: 'Keep a book visible where you relax. Read just 10 pages daily instead of setting ambitious chapter goals.' },
    { keywords: ['email', 'inbox'], insight: 'Check email at set times only (e.g., 10am, 2pm, 4pm). Use filters and unsubscribe ruthlessly.' },
    { keywords: ['meeting', 'meetings'], insight: 'Default to 25-minute meetings instead of 30. Require agendas or decline politely.' },
    { keywords: ['learn', 'course', 'study', 'skill'], insight: 'Block 30-minute learning sessions in your calendar. Consistency beats intensity for skill building.' },
    { keywords: ['meditate', 'meditation', 'mindfulness'], insight: 'Start with 3 minutes daily using an app like Headspace. Same time, same place builds the habit.' },
    { keywords: ['write', 'writing', 'journal', 'blog'], insight: 'Write for 15 minutes first thing in morning. Quantity creates quality over time.' },
    { keywords: ['budget', 'finance', 'money', 'spending'], insight: 'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate savings first.' },
    { keywords: ['sleep', 'rest', 'bedtime'], insight: 'Set a phone alarm for bedtime, not just wake-up. Dim lights 30 minutes before sleep.' },
    { keywords: ['diet', 'healthy eating', 'nutrition', 'meal'], insight: 'Prep meals on Sunday for the week. Make healthy eating the default, not a daily decision.' },
    { keywords: ['call', 'phone', 'reach out', 'contact'], insight: 'Batch similar calls together. Use calendar blocks to protect deep work from interruptions.' },
    { keywords: ['clean', 'organize', 'declutter', 'tidy'], insight: 'Use the 2-minute rule: if it takes less than 2 minutes, do it now. Otherwise, schedule it.' },
    { keywords: ['plan', 'planning', 'review'], insight: 'Sunday evening planning prevents Monday morning chaos. Review your week and set top 3 priorities.' },
    { keywords: ['project', 'deadline'], insight: 'Break projects into 2-hour chunks. Schedule the first chunk immediately to build momentum.' },
    { keywords: ['procrastin', 'avoid', 'putting off'], insight: 'Start with just 5 minutes. The hardest part is starting, not continuing.' },
    { keywords: ['news', 'media', 'youtube', 'tv', 'netflix', 'video'], insight: 'Set a daily limit and use it intentionally. Consider trading passive watching for active learning.' },
    { keywords: ['delegate'], insight: 'When delegating, be clear about desired outcome, not process. Trust and verify, but avoid micromanaging.' },
    { keywords: ['focus', 'concentration', 'distract'], insight: 'Try Pomodoro: 25 min focused work, 5 min break. Turn off all notifications during focus blocks.' },
    { keywords: ['habit', 'routine'], insight: 'Stack new habits onto existing ones: "After I pour coffee, I will write for 5 minutes."' }
  ];

  taskTexts.forEach((text, index) => {
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => text.includes(keyword))) {
        if (!insights.includes(pattern.insight)) {
          insights.push(pattern.insight);
        }
        if (insights.length >= 3) break;
      }
    }
    if (insights.length >= 3) return;
  });

  return insights;
};

export function RecommendationsBar({ tasks }: RecommendationsBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const q1Tasks = tasks.filter(t => t.is_urgent && t.is_important && !t.completed);
  const q2Tasks = tasks.filter(t => !t.is_urgent && t.is_important && !t.completed);
  const q3Tasks = tasks.filter(t => t.is_urgent && !t.is_important && !t.completed);
  const q4Tasks = tasks.filter(t => !t.is_urgent && !t.is_important && !t.completed);

  const total = q1Tasks.length + q2Tasks.length + q3Tasks.length + q4Tasks.length;
  const todaysTip = dailyTips[getDayOfYear() % dailyTips.length];
  const taskInsights = getTaskSpecificInsights([...q2Tasks, ...q3Tasks, ...q4Tasks]);

  if (total === 0) {
    return (
      <>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">Insights</h2>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {isExpanded && (
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-500 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-950 mb-1">Welcome to Your 2x2 Task Manager</h3>
            <p className="text-sm text-blue-900 mb-3">
              Start by adding tasks and organizing them by urgency and importance. Focus on Quadrant 2 (Important but Not Urgent) to prevent crises and achieve long-term success.
            </p>
            <div className="pt-3 border-t-2 border-blue-400">
              <p className="text-xs font-semibold text-blue-950 mb-1">Today's Tip</p>
              <p className="text-sm text-blue-900 italic">{todaysTip}</p>
            </div>
          </div>
        </div>
      </div>
        )}
      </>
    );
  }

  const q1Percent = (q1Tasks.length / total) * 100;
  const q2Percent = (q2Tasks.length / total) * 100;
  const q3Percent = (q3Tasks.length / total) * 100;
  const q4Percent = (q4Tasks.length / total) * 100;

  const getRecommendation = () => {
    if (q1Percent > 40) {
      return {
        icon: AlertCircle,
        color: 'red',
        title: 'Crisis Mode Detected',
        message: 'You have many urgent and important tasks. After handling these crises, invest more time in Quadrant 2 (planning, prevention, growth) to reduce future emergencies.',
        bgClass: 'from-red-100 to-orange-100',
        borderClass: 'border-red-500',
        iconClass: 'text-red-700',
        textClass: 'text-red-950',
        subtextClass: 'text-red-900'
      };
    }

    if (q2Percent >= 30) {
      return {
        icon: CheckCircle,
        color: 'green',
        title: 'Excellent Focus!',
        message: `You're investing ${q2Percent.toFixed(0)}% of your effort in Quadrant 2. This is where high-impact work happens: planning, relationship building, and personal growth. Keep this momentum!`,
        bgClass: 'from-green-100 to-emerald-100',
        borderClass: 'border-green-600',
        iconClass: 'text-green-700',
        textClass: 'text-green-950',
        subtextClass: 'text-green-900'
      };
    }

    if (q3Percent > 30) {
      return {
        icon: AlertCircle,
        color: 'yellow',
        title: 'Too Many Distractions',
        message: 'Many of your tasks are urgent but not important. Consider delegating these, setting boundaries, or saying "no" more often. Focus on what truly matters.',
        bgClass: 'from-yellow-100 to-amber-100',
        borderClass: 'border-yellow-600',
        iconClass: 'text-yellow-800',
        textClass: 'text-yellow-950',
        subtextClass: 'text-yellow-900'
      };
    }

    if (q4Percent > 25) {
      return {
        icon: TrendingUp,
        color: 'orange',
        title: 'Eliminate Time Wasters',
        message: 'You have tasks that are neither urgent nor important. Consider eliminating these to free up time for Quadrant 2 activities that drive real results.',
        bgClass: 'from-orange-100 to-amber-100',
        borderClass: 'border-orange-500',
        iconClass: 'text-orange-700',
        textClass: 'text-orange-950',
        subtextClass: 'text-orange-900'
      };
    }

    return {
      icon: Target,
      color: 'blue',
      title: 'Shift Focus to Quadrant 2',
      message: 'Invest more time in important but not urgent activities: strategic planning, skill development, relationship building, and prevention. This is the quadrant of effectiveness.',
      bgClass: 'from-blue-100 to-indigo-100',
      borderClass: 'border-blue-500',
      iconClass: 'text-blue-700',
      textClass: 'text-blue-950',
      subtextClass: 'text-blue-900'
    };
  };

  const recommendation = getRecommendation();
  const Icon = recommendation.icon;

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between bg-white border-2 border-gray-300 rounded-lg px-4 py-3 mb-3 hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${recommendation.iconClass}`} />
          <h2 className="font-semibold text-gray-900">Insights</h2>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {isExpanded && (
        <div className={`bg-gradient-to-r ${recommendation.bgClass} border ${recommendation.borderClass} rounded-lg p-4 mb-6 shadow-sm`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${recommendation.iconClass} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-semibold ${recommendation.textClass} mb-1`}>{recommendation.title}</h3>
          <p className={`text-sm ${recommendation.subtextClass} leading-relaxed`}>
            {recommendation.message}
          </p>

          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-gray-700">Q1 (Do First): {q1Tasks.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-gray-700">Q2 (Schedule): {q2Tasks.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-gray-700">Q3 (Delegate): {q3Tasks.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span className="text-gray-700">Q4 (Eliminate): {q4Tasks.length}</span>
            </div>
          </div>

          {taskInsights.length > 0 && (
            <div className={`mt-4 pt-3 border-t-2 ${recommendation.borderClass}`}>
              <div className="flex items-start gap-2">
                <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${recommendation.iconClass}`} />
                <div className="flex-1">
                  <p className={`text-xs font-semibold ${recommendation.textClass} mb-2`}>Task-Specific Tips</p>
                  <ul className="space-y-1.5">
                    {taskInsights.map((insight, idx) => (
                      <li key={idx} className={`text-sm ${recommendation.subtextClass} leading-relaxed flex items-start gap-2`}>
                        <span className="text-xs mt-0.5">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className={`mt-4 pt-3 border-t-2 ${recommendation.borderClass}`}>
            <div className="flex items-start gap-2">
              <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${recommendation.iconClass}`} />
              <div>
                <p className={`text-xs font-semibold ${recommendation.textClass} mb-1`}>Today's Tip</p>
                <p className={`text-sm italic ${recommendation.subtextClass} leading-relaxed`}>{todaysTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  );
}
