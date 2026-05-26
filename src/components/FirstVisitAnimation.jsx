import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function FirstVisitAnimation() {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if it's the first visit
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowAnimation(true);
      // Mark as visited
      localStorage.setItem('hasVisited', 'true');
      
      // Trigger animation after a small delay
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowAnimation(false), 300);
  };

  if (!showAnimation) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white dark:bg-[#232946] rounded-2xl p-8 max-w-sm w-full text-center transform transition-all duration-300 ${isVisible ? 'scale-100' : 'scale-90'}`}>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-bounce">
            <span className="text-4xl">❤️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Welcome!</h2>
          <p className="text-gray-600 dark:text-gray-300">Made with ❤️ by Israfil Hussain</p>
        </div>

        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          Get Started
        </button>
      </div>
    </div>
  );
}
