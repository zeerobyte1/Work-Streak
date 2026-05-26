import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { databases, DATABASE_ID, HABITS_COLLECTION_ID, HABIT_LOGS_COLLECTION_ID, ID, Query } from '../lib/appwrite';
import { getTodayDate, formatDate, formatDateTime } from '../lib/utils';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Calendar,
  Flame,
  TrendingUp
} from 'lucide-react';

export default function HabitDetail() {
  const { habitId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [logs, setLogs] = useState([]);
  const [completedToday, setCompletedToday] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabitData();
  }, [habitId]);

  async function fetchHabitData() {
    try {
      const habitResponse = await databases.getDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
      setHabit(habitResponse);

      const today = getTodayDate();
      const logsResponse = await databases.listDocuments(
        DATABASE_ID,
        HABIT_LOGS_COLLECTION_ID,
        [
          Query.equal('habitId', habitId),
          Query.equal('date', today)
        ]
      );

      setCompletedToday(logsResponse.documents.length > 0);

      const allLogsResponse = await databases.listDocuments(
        DATABASE_ID,
        HABIT_LOGS_COLLECTION_ID,
        [Query.equal('habitId', habitId)]
      );
      setLogs(allLogsResponse.documents);
    } catch (error) {
      console.error('Error fetching habit data:', error);
      navigate('/habits');
    } finally {
      setLoading(false);
    }
  }

  async function toggleCompletion() {
    try {
      const today = getTodayDate();
      
      if (completedToday) {
        const todayLog = logs.find(log => log.date === today);
        if (todayLog) {
          await databases.deleteDocument(
            DATABASE_ID,
            HABIT_LOGS_COLLECTION_ID,
            todayLog.$id
          );
        }
        await databases.updateDocument(
          DATABASE_ID,
          HABITS_COLLECTION_ID,
          habitId,
          { streak: Math.max(0, (habit.streak || 0) - 1) }
        );
      } else {
        await databases.createDocument(
          DATABASE_ID,
          HABIT_LOGS_COLLECTION_ID,
          ID.unique(),
          {
            habitId,
            userId: user.$id,
            date: today,
            completedAt: new Date().toISOString()
          }
        );
        await databases.updateDocument(
          DATABASE_ID,
          HABITS_COLLECTION_ID,
          habitId,
          { streak: (habit.streak || 0) + 1 }
        );
      }

      await fetchHabitData();
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  }

  if (loading) {
    return (
      <div className="mobile-container px-4 py-8">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!habit) {
    return null;
  }

  return (
    <div className="mobile-container px-4 py-8 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/habits" className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{habit.name}</h1>
          <p className="text-gray-600 text-sm dark:text-gray-300">Track your progress</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-600 text-sm dark:text-gray-300">Current Streak</p>
              <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{habit.streak || 0}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm dark:text-gray-300">Total Completed</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{logs.length}</p>
          </div>
        </div>

        {habit.endDate && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Habit ends on {formatDateTime(habit.endDate)}
            </span>
          </div>
        )}

        <button
          onClick={toggleCompletion}
          className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg ${
            completedToday
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90'
          }`}
        >
          {completedToday ? (
            <span className="flex items-center justify-center gap-2">
              <X className="w-5 h-5" />
              Mark as Incomplete
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Mark as Complete Today
            </span>
          )}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Recent Activity</h2>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-600 text-center py-4 dark:text-gray-300">No activity yet. Start tracking!</p>
        ) : (
          <div className="space-y-3">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log.$id}
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
              >
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-gray-700 dark:text-gray-200">{formatDate(log.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
