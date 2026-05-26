import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { databases, DATABASE_ID, DAILY_TASKS_COLLECTION_ID, ID, Query } from '../lib/appwrite';
import { getTodayDate } from '../lib/utils';
import { Plus, Check, Calendar, Trash2 } from 'lucide-react';

export default function DailyTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const today = getTodayDate();
      const response = await databases.listDocuments(
        DATABASE_ID,
        DAILY_TASKS_COLLECTION_ID,
        [
          Query.equal('userId', user.$id),
          Query.equal('date', today)
        ]
      );
      setTasks(response.documents);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const today = getTodayDate();
      await databases.createDocument(
        DATABASE_ID,
        DAILY_TASKS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          title: newTask,
          completed: false,
          date: today,
          createdAt: new Date().toISOString()
        }
      );
      setNewTask('');
      await fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function toggleTask(taskId, currentStatus) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        DAILY_TASKS_COLLECTION_ID,
        taskId,
        { completed: !currentStatus }
      );
      await fetchTasks();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }

  function canDeleteTask(task) {
    if (!task.completed) return true;
    if (!task.date) return true;
    const taskDate = new Date(task.date);
    taskDate.setHours(23, 59, 59, 999);
    const now = new Date();
    return now > taskDate;
  }

  async function deleteTask(taskId, task) {
    if (!canDeleteTask(task)) {
      alert('Cannot delete completed task until after the end of the day.');
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        DAILY_TASKS_COLLECTION_ID,
        taskId
      );
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="mobile-container px-4 py-8 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Daily Tasks</h1>
        <p className="text-[#7b8fa1] dark:text-[#a7c7e7]/80 text-xs mt-1">{getTodayDate()}</p>
      </div>

      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4dd4a0] dark:text-[#a7c7e7]" />
            <span className="font-semibold text-[#232946] dark:text-[#eaeaea]">Today's Progress</span>
          </div>
          <span className="text-[#4dd4a0] dark:text-[#a7c7e7] font-bold">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="w-full bg-[#e3e3e3] dark:bg-[#353a50] rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#6ee7b7] to-[#a7c7e7] dark:from-[#a7c7e7] dark:to-[#fbc2eb] h-3 rounded-full transition-all duration-500 shadow"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={addTask} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="app-input"
          />
          <button
            type="submit"
            className="app-button flex items-center justify-center px-3"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8 text-[#a0aec0] dark:text-[#a7c7e7]">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-2xl text-center py-12">
          <div className="text-5xl mb-4">📝</div>
          <p className="font-semibold text-[#232946] dark:text-[#eaeaea]">No tasks yet. Add your first task!</p>
          <p className="text-[#7b8fa1] dark:text-[#a7c7e7]/80 text-xs mt-2">Start your productive day 🚀</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.$id}
              className={`glass-card rounded-xl p-4 flex items-center gap-3 transition-all border-l-4 ${
                task.completed
                  ? 'border-[#6ee7b7] opacity-60'
                  : 'border-[#a7c7e7]'
              }`}
            >
              <button
                onClick={() => toggleTask(task.$id, task.completed)}
                className={`p-1 rounded-full transition-all shadow-md ${
                  task.completed
                    ? 'bg-[#6ee7b7] text-white'
                    : 'bg-[#a7c7e7] text-[#232946] hover:bg-[#6ee7b7] hover:text-white'
                }`}
              >
                {task.completed ? <Check className="w-5 h-5" /> : <div className="w-5 h-5" />}
              </button>
              <span
                className={`flex-1 font-semibold text-base ${
                  task.completed ? 'line-through text-[#a0aec0] dark:text-[#a7c7e7]/60' : 'text-[#232946] dark:text-[#eaeaea]'
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.$id, task)}
                className="p-2 text-[#f87171] hover:bg-[#fbc2eb]/30 rounded-full transition-colors"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
