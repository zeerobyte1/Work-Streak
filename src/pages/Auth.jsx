import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Chrome, Sparkles } from 'lucide-react';

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginWithGoogle } = useAuth();

  async function handleGoogleLogin() {
    try {
      setError('');
      setLoading(true);

      await loginWithGoogle();

      // OAuth redirect automatically handle hoga
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mobile-container px-4 py-8 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Welcome
          </h1>

          <p className="text-gray-600 dark:text-gray-300">
            Continue with Google
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          <Chrome className="w-5 h-5" />

          {loading
            ? 'Please wait...'
            : 'Continue with Google'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}