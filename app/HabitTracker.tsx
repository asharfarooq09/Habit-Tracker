"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "next-themes";
import { format, addDays, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import {
  Settings,
  BarChart2,
  Calendar,
  Plus,
  Trophy,
  Share2,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Bell,
  BookOpen,
  Dumbbell,
  Heart,
  Brain,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
} from "lucide-react";

// Types
type Habit = {
  id: string;
  name: string;
  goal: number;
  current: number;
  unit: string;
  streak: number;
  category: string;
  notes: string;
  reminderTime?: string;
  lastUpdated: string;
  completedToday: boolean;
  history: { date: string; value: number }[];
  template?: boolean;
  shared?: boolean;
};

type DailyLog = {
  date: string;
  habits: {
    [key: string]: number;
  };
};

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

type Category = {
  id: string;
  name: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Mock data
const initialCategories: Category[] = [
  { id: "1", name: "Health", color: "#3B82F6", icon: Heart },
  { id: "2", name: "Fitness", color: "#10B981", icon: Dumbbell },
  { id: "3", name: "Productivity", color: "#F59E0B", icon: BarChart2 },
  { id: "4", name: "Digital Wellbeing", color: "#EF4444", icon: Laptop },
  { id: "5", name: "Learning", color: "#8B5CF6", icon: BookOpen },
];

const habitTemplates: Habit[] = [
  {
    id: "template-1",
    name: "Meditation",
    goal: 15,
    current: 0,
    unit: "minutes",
    streak: 0,
    category: "Health",
    notes: "Daily mindfulness practice",
    reminderTime: "07:00",
    lastUpdated: new Date().toISOString(),
    completedToday: false,
    history: [],
    template: true,
  },
  {
    id: "template-2",
    name: "Reading",
    goal: 30,
    current: 0,
    unit: "minutes",
    streak: 0,
    category: "Learning",
    notes: "Read educational material",
    reminderTime: "20:00",
    lastUpdated: new Date().toISOString(),
    completedToday: false,
    history: [],
    template: true,
  },
];

const initialHabits: Habit[] = [
  {
    id: "1",
    name: "Water Intake",
    goal: 8,
    current: 0,
    unit: "glasses",
    streak: 0,
    category: "Health",
    notes: "Stay hydrated throughout the day",
    reminderTime: "09:00",
    lastUpdated: new Date().toISOString(),
    completedToday: false,
    history: [],
  },
  {
    id: "2",
    name: "Sleep",
    goal: 8,
    current: 0,
    unit: "hours",
    streak: 0,
    category: "Health",
    notes: "Get quality sleep",
    reminderTime: "22:00",
    lastUpdated: new Date().toISOString(),
    completedToday: false,
    history: [],
  },
  {
    id: "3",
    name: "Exercise",
    goal: 30,
    current: 0,
    unit: "minutes",
    streak: 0,
    category: "Fitness",
    notes: "Daily workout routine",
    reminderTime: "18:00",
    lastUpdated: new Date().toISOString(),
    completedToday: false,
    history: [],
  },
  {
    id: "4",
    name: "Screen Time",
    goal: 4,
    current: 0,
    unit: "hours",
    streak: 0,
    category: "Digital Wellbeing",
    notes: "Limit screen time for better health",
    lastUpdated: new Date().toISOString(),
    completedToday: false,
    history: [],
  },
];

const achievements: Achievement[] = [
  {
    id: "1",
    name: "Early Bird",
    description: "Complete morning habits for 7 days straight",
    icon: "🌅",
    unlocked: false,
  },
  {
    id: "2",
    name: "Consistency King",
    description: "Maintain a 30-day streak",
    icon: "👑",
    unlocked: false,
  },
  {
    id: "3",
    name: "Goal Crusher",
    description: "Achieve all daily goals for a week",
    icon: "💪",
    unlocked: false,
  },
  {
    id: "4",
    name: "Category Master",
    description: "Complete all habits in a category for a month",
    icon: "🏆",
    unlocked: false,
  },
  {
    id: "5",
    name: "Social Butterfly",
    description: "Share 5 habits with friends",
    icon: "🦋",
    unlocked: false,
  },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8B5CF6"];

const generateMockData = (habits: Habit[]): DailyLog[] => {
  const data: DailyLog[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const habitsData: { [key: string]: number } = {};
    habits.forEach((habit) => {
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
  const [completedHabits, setCompletedHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    name: "",
    goal: 1,
    unit: "",
    category: "Health",
    notes: "",
    reminderTime: "09:00",
  });
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    color: "#3B82F6",
    icon: Heart,
  });
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const toastShownRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    setMounted(true);
    // Check for daily completion
    const today = new Date().toISOString().split("T")[0];
    const lastUpdated = habits[0]?.lastUpdated.split("T")[0];
    if (today !== lastUpdated) {
      toastShownRef.current = {};
      setHabits((prevHabits) =>
        prevHabits.map((habit) => ({
          ...habit,
          completedToday: false,
          current: 0,
          lastUpdated: new Date().toISOString(),
        }))
      );
    }
  }, []);

  useEffect(() => {
    setDailyLogs(generateMockData(habits));
  }, [habits]);

  const showCompletionToast = (habit: Habit) => {
    if (!toastShownRef.current[habit.id]) {
      toast.success(
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold">Habit Completed!</p>
            <p className="text-sm">{`Great job completing ${habit.name}!`}</p>
          </div>
        </div>,
        {
          duration: 4000,
          position: "top-right",
          style: {
            background: "#10B981",
            color: "#fff",
            padding: "1rem",
            borderRadius: "0.5rem",
          },
        }
      );
      toastShownRef.current[habit.id] = true;
    }
  };

  const updateHabit = (id: string, value: number) => {
    setHabits((prevHabits) => {
      const updatedHabits = prevHabits.map((habit) => {
        if (habit.id === id) {
          const newValue = Math.max(0, Math.min(value, habit.goal));
          const streak = newValue >= habit.goal ? habit.streak + 1 : 0;
          const completedToday = newValue >= habit.goal;
          const today = new Date().toISOString().split("T")[0];
          const history = [...habit.history, { date: today, value: newValue }];

          const updatedHabit = {
            ...habit,
            current: newValue,
            streak,
            completedToday,
            lastUpdated: new Date().toISOString(),
            history,
          };

          return updatedHabit;
        }
        return habit;
      });

      // Update daily logs with the new habit data
      const today = new Date().toISOString().split("T")[0];
      const updatedLogs = [...dailyLogs];
      const todayLog = updatedLogs.find((log) => log.date === today);

      if (todayLog) {
        todayLog.habits[id] = value;
      } else {
        const newLog: DailyLog = {
          date: today,
          habits: { [id]: value },
        };
        updatedLogs.push(newLog);
      }

      // Keep only the last 7 days
      const last7Days = updatedLogs.slice(-7);
      setDailyLogs(last7Days);

      // Move completed habits to completedHabits state
      const completed = updatedHabits.filter((h) => h.completedToday);
      const notCompleted = updatedHabits.filter((h) => !h.completedToday);

      // Update completed habits state and show toast
      if (completed.length > 0) {
        setCompletedHabits((prev) => {
          const newCompleted = completed.filter(
            (c) => !prev.some((p) => p.id === c.id)
          );
          newCompleted.forEach((habit) => showCompletionToast(habit));
          return [...prev, ...newCompleted];
        });
      }

      return notCompleted;
    });
  };

  const addHabit = () => {
    if (!newHabit.name || !newHabit.unit) {
      alert("Please fill in all required fields");
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name,
      goal: newHabit.goal || 1,
      current: 0,
      unit: newHabit.unit,
      streak: 0,
      category: newHabit.category || "Health",
      notes: newHabit.notes || "",
      reminderTime: newHabit.reminderTime || undefined,
      lastUpdated: new Date().toISOString(),
      completedToday: false,
      history: [],
    };

    setHabits((prev) => {
      const updatedHabits = [...prev, habit];

      // Update daily logs with the new habit
      const today = new Date().toISOString().split("T")[0];
      const updatedLogs = [...dailyLogs];
      const todayLog = updatedLogs.find((log) => log.date === today);

      if (todayLog) {
        todayLog.habits[habit.id] = 0;
      } else {
        const newLog: DailyLog = {
          date: today,
          habits: { [habit.id]: 0 },
        };
        updatedLogs.push(newLog);
      }

      // Keep only the last 7 days
      const last7Days = updatedLogs.slice(-7);
      setDailyLogs(last7Days);

      return updatedHabits;
    });

    // Reset the form and close the modal
    setNewHabit({
      name: "",
      goal: 1,
      unit: "",
      category: "Health",
      notes: "",
      reminderTime: "09:00",
    });
    setShowAddHabit(false);
  };

  const addCategory = () => {
    if (newCategory.name) {
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        color: newCategory.color || "#3B82F6",
        icon: newCategory.icon || Heart,
      };
      setCategories((prev) => [...prev, category]);
      setShowCategories(false);
      setNewCategory({
        name: "",
        color: "#3B82F6",
        icon: Heart,
      });
    }
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => {
      const updatedHabits = prev.filter((habit) => habit.id !== id);

      // Update daily logs by removing the deleted habit
      const updatedLogs = dailyLogs.map((log) => ({
        ...log,
        habits: Object.fromEntries(
          Object.entries(log.habits).filter(([key]) => key !== id)
        ),
      }));

      setDailyLogs(updatedLogs);
      return updatedHabits;
    });
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((category) => category.id !== id));
  };

  const shareHabit = (habit: Habit) => {
    const habitData = {
      ...habit,
      shared: true,
    };
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? habitData : h)));
    setShowShare(false);
  };

  const useTemplate = (template: Habit) => {
    const habit: Habit = {
      ...template,
      id: Date.now().toString(),
      template: false,
      current: 0,
      streak: 0,
      completedToday: false,
      history: [],
    };
    setHabits((prev) => [...prev, habit]);
    setShowTemplates(false);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getCompletionEmoji = (progress: number) => {
    if (progress >= 100) return "🎉";
    if (progress >= 75) return "👍";
    if (progress >= 50) return "😊";
    return "😕";
  };

  const getCompletionMessage = (progress: number) => {
    if (progress >= 100) return "Great job! You completed your goal!";
    if (progress >= 75) return "Almost there! Keep going!";
    if (progress >= 50) return "Halfway there! You can do it!";
    return "Keep pushing! You got this!";
  };

  const getCategoryStats = () => {
    const stats = habits.reduce((acc, habit) => {
      acc[habit.category] = (acc[habit.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(stats).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getStreakCalendar = () => {
    const today = new Date();
    const startDate = startOfWeek(today);
    const endDate = endOfWeek(today);
    const days = [];

    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const completed = habits.every((habit) =>
        habit.history.some((h) => h.date === dateStr && h.value >= habit.goal)
      );
      days.push({
        date: dateStr,
        completed,
      });
      currentDate = addDays(currentDate, 1);
    }

    return days;
  };

  // Add this useEffect to handle body scroll when modals are open
  useEffect(() => {
    const isModalOpen =
      showSettings ||
      showAddHabit ||
      showAchievements ||
      showStatistics ||
      showCalendar ||
      showShare;

    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [
    showSettings,
    showAddHabit,
    showAchievements,
    showStatistics,
    showCalendar,
    showShare,
  ]);

  // Add this function to handle outside clicks
  const handleOutsideClick = (
    e: React.MouseEvent,
    setModal: (value: boolean) => void
  ) => {
    if (e.target === e.currentTarget) {
      setModal(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Toaster />

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Habit Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowStatistics(true)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 hidden sm:block"
                title="Statistics"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCalendar(true)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 hidden sm:block"
                title="Calendar"
              >
                <Calendar className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAddHabit(true)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 hidden sm:block"
                title="Add Habit"
              >
                <Plus className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAchievements(true)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 hidden sm:block"
                title="Achievements"
              >
                <Trophy className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {/* Active Habits */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            Active Habits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {habits.map((habit) => (
              <motion.div
                key={habit.id}
                whileHover={{ scale: 1.02 }}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-all duration-300 ${
                  habit.completedToday
                    ? "ring-2 ring-green-500 dark:ring-green-400"
                    : ""
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {habit.name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg sm:text-xl font-bold">
                    {habit.current} / {habit.goal} {habit.unit}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    🔥 {habit.streak} days
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5">
                  <motion.div
                    className={`h-2 sm:h-2.5 rounded-full ${getProgressColor(
                      (habit.current / habit.goal) * 100
                    )}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(
                        (habit.current / habit.goal) * 100,
                        100
                      )}%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="mt-3 sm:mt-4 flex space-x-2">
                  <button
                    onClick={() => updateHabit(habit.id, habit.current - 1)}
                    className="px-2 sm:px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateHabit(habit.id, habit.current + 1)}
                    className="px-2 sm:px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  Category: {habit.category}
                </div>
                {habit.notes && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-500">
                    Notes: {habit.notes}
                  </div>
                )}
                {habit.reminderTime && (
                  <div className="mt-2 text-xs sm:text-sm text-gray-500 flex items-center">
                    <Bell className="w-4 h-4 mr-1" />
                    <span>
                      Reminder:{" "}
                      {format(
                        new Date(`2000-01-01T${habit.reminderTime}`),
                        "h:mm a"
                      )}
                    </span>
                  </div>
                )}
                {/* Completion Status */}
                {habit.completedToday && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Completed Habits */}
        {completedHabits.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
              Completed Today
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {completedHabits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 dark:bg-green-900 rounded-lg shadow-md p-4 sm:p-6"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-green-800 dark:text-green-200">
                      {habit.name}
                    </h3>
                    <span className="text-2xl">🎉</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300">
                      {habit.current} / {habit.goal} {habit.unit}
                    </span>
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                      🔥 {habit.streak} days
                    </span>
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 sm:h-2.5">
                    <div
                      className="h-2 sm:h-2.5 rounded-full bg-green-500"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-green-600 dark:text-green-400">
                    Completed at {format(new Date(), "h:mm a")}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Weekly Progress
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyLogs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  {habits.map((habit, index) => (
                    <Line
                      key={habit.id}
                      type="monotone"
                      dataKey={`habits.${habit.id}`}
                      stroke={COLORS[index % COLORS.length]}
                      name={habit.name}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Habit Categories
            </h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getCategoryStats()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {getCategoryStats().map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-4 gap-1 p-2">
          <button
            onClick={() => setShowStatistics(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Statistics"
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-xs mt-1">Stats</span>
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Calendar"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Calendar</span>
          </button>
          <button
            onClick={() => setShowAddHabit(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Add Habit"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs mt-1">Add</span>
          </button>
          <button
            onClick={() => setShowAchievements(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Achievements"
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs mt-1">Achieve</span>
          </button>
        </div>
      </div>

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
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
              <h2 className="text-xl font-bold mb-4">Habit Templates</h2>
              <div className="space-y-4">
                {habitTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg dark:border-gray-700"
                  >
                    <h3 className="font-semibold">{template.name}</h3>
                    <p className="text-sm text-gray-500">{template.notes}</p>
                    <button
                      onClick={() => useTemplate(template)}
                      className="mt-2 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                      Use Template
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowTemplates(false)}
                  className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {(showSettings ||
          showAddHabit ||
          showAchievements ||
          showStatistics ||
          showCalendar ||
          showShare) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => handleOutsideClick(e, setShowSettings)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Theme
                    </label>
                    <select
                      value={resolvedTheme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="light" className="flex items-center">
                        <Sun className="w-4 h-4 mr-2" /> Light
                      </option>
                      <option value="dark" className="flex items-center">
                        <Moon className="w-4 h-4 mr-2" /> Dark
                      </option>
                      <option value="system" className="flex items-center">
                        <Laptop className="w-4 h-4 mr-2" /> System
                      </option>
                    </select>
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => handleOutsideClick(e, setShowAddHabit)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  Add New Habit
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newHabit.name}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, name: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Enter habit name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Goal *
                    </label>
                    <input
                      type="number"
                      value={newHabit.goal}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          goal: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Unit *
                    </label>
                    <input
                      type="text"
                      value={newHabit.unit}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, unit: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      placeholder="e.g., glasses, minutes, hours"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={newHabit.category}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, category: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notes
                    </label>
                    <textarea
                      value={newHabit.notes}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, notes: e.target.value })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      placeholder="Add any notes about this habit"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Reminder Time
                    </label>
                    <input
                      type="time"
                      value={newHabit.reminderTime}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          reminderTime: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div className="flex space-x-4 pt-2">
                    <button
                      onClick={addHabit}
                      className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                    >
                      Add Habit
                    </button>
                    <button
                      onClick={() => {
                        setShowAddHabit(false);
                        setNewHabit({
                          name: "",
                          goal: 1,
                          unit: "",
                          category: "Health",
                          notes: "",
                          reminderTime: "09:00",
                        });
                      }}
                      className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => handleOutsideClick(e, setShowAchievements)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  Achievements
                </h2>
                <div className="space-y-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg ${
                        achievement.unlocked
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-gray-100 dark:bg-gray-700"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h3 className="font-semibold">{achievement.name}</h3>
                          <p className="text-sm text-gray-500">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setShowAchievements(false)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics Modal */}
      <AnimatePresence>
        {showStatistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => handleOutsideClick(e, setShowStatistics)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  Statistics
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Total Habits</h3>
                    <p className="text-2xl">{habits.length}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Total Streaks</h3>
                    <p className="text-2xl">
                      {habits.reduce((sum, habit) => sum + habit.streak, 0)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Completion Rate</h3>
                    <p className="text-2xl">
                      {Math.round(
                        (habits.filter((h) => h.completedToday).length /
                          habits.length) *
                          100
                      )}
                      %
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStatistics(false)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => handleOutsideClick(e, setShowCalendar)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  Streak Calendar
                </h2>
                <div className="grid grid-cols-7 gap-2">
                  {getStreakCalendar().map((day, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center rounded ${
                        day.completed
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    >
                      {format(new Date(day.date), "EEE")}
                      <br />
                      {format(new Date(day.date), "d")}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="w-full mt-4 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && selectedHabit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => handleOutsideClick(e, setShowShare)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white/95 dark:bg-gray-800/95 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto backdrop-blur-sm"
            >
              <div className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4">
                  Share Habit
                </h2>
                <div className="space-y-4">
                  <p>Share your habit with friends and family!</p>
                  <button
                    onClick={() => shareHabit(selectedHabit)}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setShowShare(false)}
                    className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories Modal */}
      <AnimatePresence>
        {showCategories && (
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
              <h2 className="text-xl font-bold mb-4">Categories</h2>
              <div className="space-y-4">
                {categories.map((category) => {
                  const Icon = category.icon; // Extract the component type
                  return (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-2">
                        <span>
                          <Icon className="w-5 h-5 text-gray-700 dark:text-white" />
                        </span>
                        <span>{category.name}</span>
                      </div>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    </div>
                  );
                })}

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, color: e.target.value })
                    }
                    className="w-full"
                  />
                  <input
                    type="text"
                    placeholder="Icon (component name or JSX)"
                    value={newCategory.icon}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, icon: e.target.value })
                    }
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <button
                    onClick={addCategory}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                  >
                    Add Category
                  </button>
                </div>

                <button
                  onClick={() => setShowCategories(false)}
                  className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
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
