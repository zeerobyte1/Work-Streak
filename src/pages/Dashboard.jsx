import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CheckSquare, 
  Flame, 
  Calendar, 
  User, 
  LogOut, 
  Sparkles,
  TrendingUp
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  const menuItems = [
    {
      icon: CheckSquare,
      label: 'Daily Tasks',
      description: 'Create and complete daily tasks',
      to: '/daily-tasks',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Flame,
      label: 'Habits',
      description: 'Track your habits and streaks',
      to: '/habits',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Calendar,
      label: 'Future Tasks',
      description: 'Plan tasks with deadlines',
      to: '/future-tasks',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: TrendingUp,
      label: 'Profile',
      description: 'View your progress and stats',
      to: '/profile',
      color: 'from-green-500 to-teal-500'
    }
  ];

  return (
    <div className="mobile-container px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Hello, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1 dark:text-gray-300">Ready to crush your goals today?</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="w-5 h-5 " />
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Today's Focus</h2>
          </div>
          <p className="text-gray-600 text-sm dark:text-gray-300">
            Start by checking your daily tasks and tracking your habits. Consistency is key! 🚀
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block group"
          >
            <div className="glass-card rounded-2xl p-5 hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-gradient-to-br ${item.color} rounded-xl shadow-md`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-gray-600 text-sm dark:text-gray-300">{item.description}</p>
                </div>
                <div className="">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm dark:text-gray-400">
          Stay consistent, achieve greatness! 💪
        </p>
      </div>
    </div>
  );
}
