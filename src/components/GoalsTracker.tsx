import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit3, Trash2, TrendingUp, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../utils/currencyService';
import { loadGoals, saveGoals } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  userId?: string;
}

interface GoalsTrackerProps {
  baseCurrency: string;
  onGoalUpdate?: (goals: Goal[]) => void;
}

const GoalsTracker: React.FC<GoalsTrackerProps> = ({ baseCurrency, onGoalUpdate }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    targetDate: '',
    category: 'Savings',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    const savedGoals = loadGoals(user?.id);
    setGoals(savedGoals);
  }, [user?.id]);

  const saveGoalsData = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    saveGoals(updatedGoals, user?.id);
    onGoalUpdate?.(updatedGoals);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal: Goal = {
      id: editingGoal?.id || Date.now().toString(),
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: editingGoal?.currentAmount || 0,
      targetDate: formData.targetDate,
      category: formData.category,
      priority: formData.priority,
      createdAt: editingGoal?.createdAt || new Date().toISOString(),
      userId: user?.id
    };

    const updatedGoals = editingGoal
      ? goals.map(g => g.id === editingGoal.id ? newGoal : g)
      : [...goals, newGoal];

    saveGoalsData(updatedGoals);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      targetAmount: '',
      targetDate: '',
      category: 'Savings',
      priority: 'medium'
    });
    setShowForm(false);
    setEditingGoal(null);
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      title: goal.title,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    saveGoalsData(updatedGoals);
  };

  const updateProgress = (id: string, amount: number) => {
    const updatedGoals = goals.map(g => 
      g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g
    );
    saveGoalsData(updatedGoals);
  };

  const getProgressPercentage = (goal: Goal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-500/10 p-3 rounded-lg">
            <Target className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Financial Goals</h2>
            <p className="text-gray-400">Track your savings and financial milestones</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal);
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const isCompleted = progress >= 100;
          const isOverdue = daysRemaining < 0 && !isCompleted;

          return (
            <div key={goal.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{goal.title}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getPriorityColor(goal.priority)}`}>
                    {goal.priority} priority
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-white">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Current</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(goal.currentAmount, baseCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Target</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(goal.targetAmount, baseCurrency)}
                  </span>
                </div>
              </div>

              {/* Time Remaining */}
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className={`text-sm ${
                    isCompleted ? 'text-green-400' :
                    isOverdue ? 'text-red-400' :
                    daysRemaining <= 30 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    {isCompleted ? 'Goal Completed!' :
                     isOverdue ? `${Math.abs(daysRemaining)} days overdue` :
                     daysRemaining === 0 ? 'Due today' :
                     `${daysRemaining} days remaining`}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              {!isCompleted && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateProgress(goal.id, 50)}
                    className="flex-1 bg-gray-700 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    +$50
                  </button>
                  <button
                    onClick={() => updateProgress(goal.id, 100)}
                    className="flex-1 bg-gray-700 text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    +$100
                  </button>
                </div>
              )}

              {isCompleted && (
                <div className="flex items-center justify-center space-x-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Completed!</span>
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Goals Yet</h3>
            <p className="text-gray-400 mb-4">
              Set your first financial goal to start tracking your progress
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Your First Goal
            </button>
          </div>
        )}
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Savings">Savings</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Investment">Investment</option>
                    <option value="Debt Payoff">Debt Payoff</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsTracker;