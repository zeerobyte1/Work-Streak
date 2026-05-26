import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { databases, DATABASE_ID, FUTURE_TASKS_COLLECTION_ID, ID, Query } from '../lib/appwrite';
import { formatDate } from '../lib/utils';
import { 
  Plus, 
  Calendar, 
  Check, 
  Trash2,
  Clock
} from 'lucide-react';

export default function FutureTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FUTURE_TASKS_COLLECTION_ID,
        [Query.equal('userId', user.$id)]
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
    if (!newTask.trim() || !deadline) return;

    try {
      await databases.createDocument(
        DATABASE_ID,
        FUTURE_TASKS_COLLECTION_ID,
        ID.unique(),
        {
          userId: user.$id,
          title: newTask,
          deadline,
          completed: false,
          createdAt: new Date().toISOString()
        }
      );
      setNewTask('');
      setDeadline('');
      await fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async function toggleTask(taskId, currentStatus) {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        FUTURE_TASKS_COLLECTION_ID,
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
    if (!task.deadline) return true;
    const deadline = new Date(task.deadline);
    deadline.setHours(23, 59, 59, 999);
    const now = new Date();
    return now > deadline;
  }

  async function deleteTask(taskId, task) {
    if (!canDeleteTask(task)) {
      alert('Cannot delete completed task until after the deadline.');
      return;
    }

    try {
      await databases.deleteDocument(
        DATABASE_ID,
        FUTURE_TASKS_COLLECTION_ID,
        taskId
      );
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="mobile-container px-4 py-8 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Future Tasks</h1>
        <p className="text-gray-600 text-sm dark:text-gray-300">Plan ahead with deadlines</p>
      </div>

      <form onSubmit={addTask} className="glass-card rounded-2xl p-4 mb-6">
        <div className="space-y-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Task title..."
            className="app-input"
          />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="app-input"
          />
          <button
            type="submit"
            className="app-button w-full"
          >
            Add Task
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-gray-600 dark:text-gray-300">No future tasks yet. Plan your goals!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
            .map((task) => (
              <div
                key={task.$id}
                className={`glass-card rounded-xl p-4 transition-all ${
                  task.completed ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTask(task.$id, task.completed)}
                    className={`p-2 rounded-full transition-all mt-1 ${
                      task.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {task.completed ? <Check className="w-5 h-5" /> : <div className="w-5 h-5" />}
                  </button>
                  <div className="flex-1">
                    <h3
                      className={`font-semibold ${
                        task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-100'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock className={`w-4 h-4 ${isOverdue(task.deadline) && !task.completed ? 'text-red-500' : 'text-purple-500'}`} />
                      <span className={`text-sm ${isOverdue(task.deadline) && !task.completed ? 'text-red-500 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>
                        {formatDate(task.deadline)}
                        {isOverdue(task.deadline) && !task.completed && ' (Overdue)'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task.$id, task)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
