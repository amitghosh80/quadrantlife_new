import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import EisenhowerMatrix from './components/EisenhowerMatrix';
import { GoalManager } from './components/GoalManager';
import { BalanceIndicator } from './components/BalanceIndicator';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { Target, LayoutGrid, TrendingUp } from 'lucide-react';

type View = 'matrix' | 'goals' | 'balance';

function App() {
  const { user, loading, isPasswordRecovery, setIsPasswordRecovery } = useAuth();
  const [currentView, setCurrentView] = useState<View>('matrix');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Auth />
        <ResetPasswordModal
          isOpen={isPasswordRecovery}
          onClose={() => setIsPasswordRecovery(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <ResetPasswordModal
        isOpen={isPasswordRecovery}
        onClose={() => setIsPasswordRecovery(false)}
      />

      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex justify-center gap-1 py-3" aria-label="Main navigation">
            <button
              onClick={() => setCurrentView('matrix')}
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentView === 'matrix'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={currentView === 'matrix' ? 'page' : undefined}
            >
              <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Task Matrix</span>
            </button>
            <button
              onClick={() => setCurrentView('goals')}
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentView === 'goals'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={currentView === 'goals' ? 'page' : undefined}
            >
              <Target className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Goals</span>
            </button>
            <button
              onClick={() => setCurrentView('balance')}
              className={`flex items-center gap-2 px-3 sm:px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentView === 'balance'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              aria-current={currentView === 'balance' ? 'page' : undefined}
            >
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
              <span className="hidden sm:inline">Balance</span>
            </button>
          </nav>
        </div>
      </header>

      <main>
        {currentView === 'matrix' ? (
          <EisenhowerMatrix />
        ) : currentView === 'goals' ? (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <GoalManager />
          </section>
        ) : (
          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <BalanceIndicator />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
