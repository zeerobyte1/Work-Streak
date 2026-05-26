import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { databases, DATABASE_ID, HABITS_COLLECTION_ID, HABIT_LOGS_COLLECTION_ID, ID, Query } from '../lib/appwrite';
import { formatDate, formatDateTime } from '../lib/utils';
import { 
  Plus, 
  Flame, 
  Target,
  Trash2,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function Habits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
      );
      setHabits(response.documents);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addHabit(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;

    try {
      const endDateTime = endDate ? `${endDate}T${endTime}:00` : null;
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          name: newHabit,
          createdAt: new Date().toISOString(),
          streak: 0,
          endDate: endDateTime
        }
      );
      setNewHabit('');
      setEndDate('');
      setEndTime('23:59');
      await fetchHabits();
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  }

  function canDeleteHabit(habit) {
    if (!habit.endDate) return true;
    const endDate = new Date(habit.endDate);
    const now = new Date();
    return now > endDate;
  }

  async function deleteHabit(habitId, habit) {
    if (!canDeleteHabit(habit)) {
      alert('Cannot delete this habit until after the end date.');
      return;
    }

    try {
      // First, delete all habit logs for this habit
      const logs = await databases.listDocuments(
        DATABASE_ID,
        HABIT_LOGS_COLLECTION_ID,
        [Query.equal('habitId', habitId)]
      );
      
      for (const log of logs.documents) {
        await databases.deleteDocument(
          DATABASE_ID,
          HABIT_LOGS_COLLECTION_ID,
          log.$id
        );
      }
      
      // Then delete the habit
      await databases.deleteDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        habitId
      );
      await fetchHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }

  return (
    <div className="mobile-container px-4 py-8 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Habits</h1>
        <p className="text-gray-600 text-sm dark:text-gray-300">Track your daily habits</p>
      </div>

      <form onSubmit={addHabit} className="glass-card rounded-2xl p-4 mb-6">
        <div className="space-y-3">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add a new habit..."
            className="app-input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="app-input"
            placeholder="End date (optional)"
          />
          <button
            type="submit"
            className="app-button w-full"
          >
            Add Habit
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading habits...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔥</div>
          <p className="text-gray-600 dark:text-gray-300">No habits yet. Start building good habits!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => (
            <Link
              key={habit.$id}
              to={`/habits/${habit.$id}`}
              className="block"
            >
              <div className="glass-card rounded-xl p-4 hover:scale-[1.02] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{habit.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {habit.streak || 0} day streak
                      </span>
                    </div>
                    {habit.endDate && (
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Until {formatDateTime(habit.endDate)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      deleteHabit(habit.$id, habit);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
