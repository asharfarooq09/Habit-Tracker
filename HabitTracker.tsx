'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTheme } from 'next-themes';

// Types
type Habit = {
  id: string;
  name: string;
  goal: number;
  current: number;
  unit: string;
  streak: number;
  lastUpdated: string;
};

type DailyLog = {
  date: string;
  habits: {
    [key: string]: number;
  };
};

// Mock data
const initialHabits: Habit[] = [
  {
    id: '1',
    name: 'Water Intake',
    goal: 8,
    current: 0,
    unit: 'glasses',
    streak: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sleep',
    goal: 8,
    current: 0,
    unit: 'hours',
    streak: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Exercise',
    goal: 30,
    current: 0,
    unit: 'minutes',
    streak: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Screen Time',
    goal: 4,
    current: 0,
    unit: 'hours',
    streak: 0,
    lastUpdated: new Date().toISOString(),
  },
];

const generateMockData = (habits: Habit[]): DailyLog[] => {
  const data: DailyLog[] = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const habitsData: { [key: string]: number } = {};
    habits.forEach(habit => {
      habitsData[habit.id] = Math.floor(Math.random() * (habit.goal + 2));
    });
    
    data.push({
      date: dateStr,
      habits: habitsData,
    });
  }
  
  return data;
};

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setDailyLogs(generateMockData(habits));
  }, [habits]);

  const updateHabit = (id: string, value: number) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id === id) {
          const newValue = Math.max(0, Math.min(value, habit.goal));
          const streak = newValue >= habit.goal ? habit.streak + 1 : 0;
          return {
            ...habit,
            current: newValue,
            streak,
            lastUpdated: new Date().toISOString(),
          };
        }
        return habit;
      })
    );
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">Habit Tracker</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {theme === 'dark' ? '🌞' : '🌙'}
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {habits.map(habit => (
            <motion.div
              key={habit.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-semibold mb-2">{habit.name}</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">
                  {habit.current} / {habit.goal} {habit.unit}
                </span>
                <span className="text-sm text-gray-500">🔥 {habit.streak} days</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${getProgressColor(
                    (habit.current / habit.goal) * 100
                  )}`}
                  style={{
                    width: `${Math.min((habit.current / habit.goal) * 100, 100)}%`,
                  }}
                ></div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => updateHabit(habit.id, habit.current - 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  -
                </button>
                <button
                  onClick={() => updateHabit(habit.id, habit.current + 1)}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  +
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Progress</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyLogs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="habits.1"
                    stroke="#3B82F6"
                    name="Water Intake"
                  />
                  <Line
                    type="monotone"
                    dataKey="habits.2"
                    stroke="#10B981"
                    name="Sleep"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyLogs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="habits.3" fill="#F59E0B" name="Exercise" />
                  <Bar dataKey="habits.4" fill="#EF4444" name="Screen Time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-xl font-bold mb-4">Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Habit Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 