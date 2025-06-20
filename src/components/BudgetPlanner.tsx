import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Calculator, TrendingUp, AlertTriangle, CheckCircle, Edit3, Trash2, Plus, Target, Calendar, DollarSign, TrendingDown, Clock, Zap } from 'lucide-react';
import { Transaction, CurrencySettings } from '../types';
import { formatCurrency } from '../utils/currencyService';
import { getTransactionsInCurrency, loadBudgets, saveBudgets } from '../utils/storage';
import { DEFAULT_CATEGORIES, getCategoryIcon, getCategoryColor } from '../constants/categories';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths, getDaysInMonth } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

interface BudgetCategory {
  id: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  color: string;
  transactionCount: number;
  averageTransaction: number;
  lastMonthSpent: number;
  projectedSpending: number;
  dailyAverage: number;
  recommendedDailyLimit: number;
  daysRemaining: number;
  spendingPace: 'slow' | 'normal' | 'fast' | 'critical';
  weeklyBreakdown: number[];
  userId?: string;
}

interface BudgetPlannerProps {
  transactions: Transaction[];
  baseCurrency: string;
  currencySettings: CurrencySettings;
}

const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ transactions, baseCurrency, currencySettings }) => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetCategory | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'last' | 'projected'>('current');
  const [isInitialized, setIsInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: DEFAULT_CATEGORIES[0].name,
    budgetAmount: '',
    color: DEFAULT_CATEGORIES[0].color
  });

  // Enhanced date calculations
  const dateAnalysis = useMemo(() => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysInCurrentMonth = getDaysInMonth(currentMonth);
    const daysPassed = now.getDate();
    const daysRemaining = daysInCurrentMonth - daysPassed;
    const monthProgress = daysPassed / daysInCurrentMonth;
    
    return {
      now,
      currentMonth,
      daysInCurrentMonth,
      daysPassed,
      daysRemaining,
      monthProgress,
      weeksRemaining: Math.ceil(daysRemaining / 7)
    };
  }, []);

  // Calculate spending data from transactions with enhanced date analysis
  const spendingData = useMemo(() => {
    const convertedTransactions = getTransactionsInCurrency(transactions, baseCurrency, currencySettings);
    const lastMonth = subMonths(dateAnalysis.currentMonth, 1);

    // Current month expenses
    const currentMonthExpenses = convertedTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             isWithinInterval(transactionDate, {
               start: startOfMonth(dateAnalysis.currentMonth),
               end: endOfMonth(dateAnalysis.currentMonth)
             });
    });

    // Last month expenses
    const lastMonthExpenses = convertedTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return t.type === 'expense' && 
             isWithinInterval(transactionDate, {
               start: startOfMonth(lastMonth),
               end: endOfMonth(lastMonth)
             });
    });

    // Group by category with enhanced analysis
    const currentByCategory = currentMonthExpenses.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { 
          total: 0, 
          count: 0, 
          transactions: [],
          dailySpending: Array(dateAnalysis.daysInCurrentMonth).fill(0),
          weeklySpending: [0, 0, 0, 0, 0] // 5 weeks max
        };
      }
      acc[t.category].total += t.amount;
      acc[t.category].count += 1;
      acc[t.category].transactions.push(t);
      
      // Track daily spending
      const transactionDay = new Date(t.date).getDate() - 1; // 0-indexed
      if (transactionDay >= 0 && transactionDay < dateAnalysis.daysInCurrentMonth) {
        acc[t.category].dailySpending[transactionDay] += t.amount;
      }
      
      // Track weekly spending
      const weekIndex = Math.floor(transactionDay / 7);
      if (weekIndex >= 0 && weekIndex < 5) {
        acc[t.category].weeklySpending[weekIndex] += t.amount;
      }
      
      return acc;
    }, {} as Record<string, { 
      total: number; 
      count: number; 
      transactions: Transaction[];
      dailySpending: number[];
      weeklySpending: number[];
    }>);

    const lastByCategory = lastMonthExpenses.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { total: 0, count: 0 };
      }
      acc[t.category].total += t.amount;
      acc[t.category].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return { currentByCategory, lastByCategory, currentMonth: dateAnalysis.currentMonth, lastMonth };
  }, [transactions, baseCurrency, currencySettings, dateAnalysis]);

  // Load budgets only once when component mounts or user changes
  useEffect(() => {
    const savedBudgets = loadBudgets(user?.id);
    
    if (savedBudgets.length > 0) {
      setBudgets(savedBudgets);
    } else {
      // Create smart initial budgets based on spending patterns only if no saved budgets exist
      const topCategories = Object.entries(spendingData.currentByCategory)
        .sort(([,a], [,b]) => b.total - a.total)
        .slice(0, 8);

      if (topCategories.length > 0) {
        const initialBudgets = topCategories.map(([categoryName, data], index) => {
          const category = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName) || DEFAULT_CATEGORIES[0];
          // Suggest budget 20% higher than current spending
          const suggestedBudget = Math.ceil(data.total * 1.2);
          
          return {
            id: `budget-${index}`,
            name: categoryName,
            budgetAmount: suggestedBudget,
            spentAmount: 0,
            color: category.color,
            transactionCount: 0,
            averageTransaction: 0,
            lastMonthSpent: 0,
            projectedSpending: 0,
            dailyAverage: 0,
            recommendedDailyLimit: 0,
            daysRemaining: dateAnalysis.daysRemaining,
            spendingPace: 'normal' as const,
            weeklyBreakdown: [],
            userId: user?.id
          };
        });
        setBudgets(initialBudgets);
      } else {
        // Default budgets if no transaction data
        const defaultBudgets = DEFAULT_CATEGORIES.slice(0, 6).map((cat, index) => ({
          id: `budget-${index}`,
          name: cat.name,
          budgetAmount: 500,
          spentAmount: 0,
          color: cat.color,
          transactionCount: 0,
          averageTransaction: 0,
          lastMonthSpent: 0,
          projectedSpending: 0,
          dailyAverage: 0,
          recommendedDailyLimit: 0,
          daysRemaining: dateAnalysis.daysRemaining,
          spendingPace: 'normal' as const,
          weeklyBreakdown: [],
          userId: user?.id
        }));
        setBudgets(defaultBudgets);
      }
    }
    setIsInitialized(true);
  }, [user?.id]); // Only depend on user ID, not spending data

  // Update budget calculations when spending data changes, but preserve budget amounts
  useEffect(() => {
    if (!isInitialized || budgets.length === 0) return;

    const updatedBudgets = budgets.map(budget => {
      const currentData = spendingData.currentByCategory[budget.name] || { 
        total: 0, 
        count: 0, 
        transactions: [],
        dailySpending: Array(dateAnalysis.daysInCurrentMonth).fill(0),
        weeklySpending: [0, 0, 0, 0, 0]
      };
      const lastData = spendingData.lastByCategory[budget.name] || { total: 0, count: 0 };
      
      // Enhanced projections based on current pace and date analysis
      const dailyAverage = dateAnalysis.daysPassed > 0 ? currentData.total / dateAnalysis.daysPassed : 0;
      const projectedSpending = dailyAverage * dateAnalysis.daysInCurrentMonth;
      
      // Calculate recommended daily limit for remaining days
      const remainingBudget = Math.max(0, budget.budgetAmount - currentData.total);
      const recommendedDailyLimit = dateAnalysis.daysRemaining > 0 ? remainingBudget / dateAnalysis.daysRemaining : 0;
      
      // Determine spending pace
      const expectedSpendingByNow = budget.budgetAmount * dateAnalysis.monthProgress;
      let spendingPace: 'slow' | 'normal' | 'fast' | 'critical';
      
      if (currentData.total >= budget.budgetAmount) {
        spendingPace = 'critical';
      } else if (currentData.total > expectedSpendingByNow * 1.2) {
        spendingPace = 'fast';
      } else if (currentData.total < expectedSpendingByNow * 0.7) {
        spendingPace = 'slow';
      } else {
        spendingPace = 'normal';
      }

      return {
        ...budget, // Preserve all existing budget data including budgetAmount
        spentAmount: currentData.total,
        transactionCount: currentData.count,
        averageTransaction: currentData.count > 0 ? currentData.total / currentData.count : 0,
        lastMonthSpent: lastData.total,
        projectedSpending: Math.max(projectedSpending, currentData.total),
        dailyAverage,
        recommendedDailyLimit,
        daysRemaining: dateAnalysis.daysRemaining,
        spendingPace,
        weeklyBreakdown: currentData.weeklySpending,
        userId: user?.id
      };
    });

    setBudgets(updatedBudgets);
    // Save the updated budgets to preserve calculations
    saveBudgets(updatedBudgets, user?.id);
  }, [spendingData, dateAnalysis, isInitialized, user?.id]); // Don't include budgets in dependencies to avoid infinite loop

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = DEFAULT_CATEGORIES.find(cat => cat.name === formData.name);
    const currentSpending = spendingData.currentByCategory[formData.name]?.total || 0;
    
    const newBudget: BudgetCategory = {
      id: editingBudget?.id || `budget-${Date.now()}`,
      name: formData.name,
      budgetAmount: parseFloat(formData.budgetAmount),
      spentAmount: currentSpending,
      color: selectedCategory?.color || formData.color,
      transactionCount: spendingData.currentByCategory[formData.name]?.count || 0,
      averageTransaction: 0,
      lastMonthSpent: spendingData.lastByCategory[formData.name]?.total || 0,
      projectedSpending: 0,
      dailyAverage: 0,
      recommendedDailyLimit: 0,
      daysRemaining: dateAnalysis.daysRemaining,
      spendingPace: 'normal',
      weeklyBreakdown: [],
      userId: user?.id
    };

    const updatedBudgets = editingBudget
      ? budgets.map(b => b.id === editingBudget.id ? newBudget : b)
      : [...budgets, newBudget];

    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets, user?.id);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ 
      name: DEFAULT_CATEGORIES[0].name, 
      budgetAmount: '', 
      color: DEFAULT_CATEGORIES[0].color 
    });
    setShowForm(false);
    setEditingBudget(null);
  };

  const handleEdit = (budget: BudgetCategory) => {
    setFormData({
      name: budget.name,
      budgetAmount: budget.budgetAmount.toString(),
      color: budget.color
    });
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const updatedBudgets = budgets.filter(b => b.id !== id);
    setBudgets(updatedBudgets);
    saveBudgets(updatedBudgets, user?.id);
  };

  const handleCategoryChange = (categoryName: string) => {
    const selectedCategory = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
    const currentSpending = spendingData.currentByCategory[categoryName]?.total || 0;
    const lastMonthSpending = spendingData.lastByCategory[categoryName]?.total || 0;
    
    // Smart budget suggestion based on date analysis
    const dailyAverageCurrentMonth = dateAnalysis.daysPassed > 0 ? currentSpending / dateAnalysis.daysPassed : 0;
    const projectedFromCurrent = dailyAverageCurrentMonth * dateAnalysis.daysInCurrentMonth;
    
    const suggestedBudget = Math.max(
      projectedFromCurrent * 1.15, // 15% buffer over projected
      currentSpending * 1.2, // 20% buffer over current spending
      lastMonthSpending * 1.1, // 10% buffer over last month
      100 // Minimum budget
    );

    setFormData({
      ...formData,
      name: categoryName,
      color: selectedCategory?.color || formData.color,
      budgetAmount: Math.ceil(suggestedBudget).toString()
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalLastMonth = budgets.reduce((sum, b) => sum + b.lastMonthSpent, 0);
  const totalProjected = budgets.reduce((sum, b) => sum + b.projectedSpending, 0);
  const remainingBudget = totalBudget - totalSpent;

  const getBudgetStatus = (budget: BudgetCategory) => {
    const percentage = (budget.spentAmount / budget.budgetAmount) * 100;
    const projectedPercentage = (budget.projectedSpending / budget.budgetAmount) * 100;
    
    if (percentage >= 100) return { 
      status: 'over', 
      color: 'text-red-400', 
      icon: AlertTriangle, 
      message: 'Over budget!',
      advice: `You've exceeded your budget. Consider reducing spending for the remaining ${budget.daysRemaining} days.`
    };
    
    if (projectedPercentage >= 100) return { 
      status: 'projected-over', 
      color: 'text-orange-400', 
      icon: AlertTriangle, 
      message: 'Will exceed budget',
      advice: `At current pace, you'll exceed budget by ${formatCurrency(budget.projectedSpending - budget.budgetAmount, baseCurrency)}. Limit to ${formatCurrency(budget.recommendedDailyLimit, baseCurrency)}/day.`
    };
    
    if (percentage >= 80) return { 
      status: 'warning', 
      color: 'text-yellow-400', 
      icon: AlertTriangle, 
      message: 'Approaching limit',
      advice: `You have ${formatCurrency(budget.budgetAmount - budget.spentAmount, baseCurrency)} left for ${budget.daysRemaining} days. Limit: ${formatCurrency(budget.recommendedDailyLimit, baseCurrency)}/day.`
    };
    
    if (budget.spendingPace === 'fast') return {
      status: 'fast-pace',
      color: 'text-orange-400',
      icon: Zap,
      message: 'Spending quickly',
      advice: `You're spending faster than expected. Consider slowing down to ${formatCurrency(budget.recommendedDailyLimit, baseCurrency)}/day.`
    };
    
    if (percentage >= 50) return { 
      status: 'moderate', 
      color: 'text-blue-400', 
      icon: TrendingUp, 
      message: 'On track',
      advice: `Good pace! You can spend up to ${formatCurrency(budget.recommendedDailyLimit, baseCurrency)}/day for the remaining ${budget.daysRemaining} days.`
    };
    
    return { 
      status: 'good', 
      color: 'text-green-400', 
      icon: CheckCircle, 
      message: 'Under budget',
      advice: `Excellent control! You're well within budget with ${formatCurrency(budget.budgetAmount - budget.spentAmount, baseCurrency)} remaining.`
    };
  };

  const getDisplayAmount = (budget: BudgetCategory) => {
    switch (selectedPeriod) {
      case 'last': return budget.lastMonthSpent;
      case 'projected': return budget.projectedSpending;
      default: return budget.spentAmount;
    }
  };

  const getDisplayTotal = () => {
    switch (selectedPeriod) {
      case 'last': return totalLastMonth;
      case 'projected': return totalProjected;
      default: return totalSpent;
    }
  };

  const getPaceColor = (pace: string) => {
    switch (pace) {
      case 'critical': return 'text-red-400';
      case 'fast': return 'text-orange-400';
      case 'normal': return 'text-blue-400';
      case 'slow': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  // Auto-suggest categories that have spending but no budget
  const unbudgetedCategories = Object.keys(spendingData.currentByCategory).filter(
    categoryName => !budgets.some(b => b.name === categoryName)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-green-500/10 p-3 rounded-lg">
            <Calculator className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Smart Budget Planner</h2>
            <p className="text-gray-400">
              Day {dateAnalysis.daysPassed} of {dateAnalysis.daysInCurrentMonth} • {dateAnalysis.daysRemaining} days remaining
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'current' | 'last' | 'projected')}
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="current">This Month</option>
            <option value="last">Last Month</option>
            <option value="projected">Projected</option>
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Budget</span>
          </button>
        </div>
      </div>

      {/* Month Progress Bar */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Month Progress</span>
          <span className="text-sm text-gray-400">
            {(dateAnalysis.monthProgress * 100).toFixed(1)}% complete
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
            style={{ width: `${dateAnalysis.monthProgress * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{format(dateAnalysis.currentMonth, 'MMM 1')}</span>
          <span>Today</span>
          <span>{format(endOfMonth(dateAnalysis.currentMonth), 'MMM d')}</span>
        </div>
      </div>

      {/* Unbudgeted Categories Alert */}
      {unbudgetedCategories.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-blue-300 font-medium mb-1">Unbudgeted Spending Detected</h4>
              <p className="text-blue-200/80 text-sm mb-3">
                You have spending in categories without budgets: {unbudgetedCategories.join(', ')}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Create budgets for these categories →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(totalBudget, baseCurrency)}
              </p>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-lg">
              <PieChart className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">
                {selectedPeriod === 'current' ? 'Spent This Month' : 
                 selectedPeriod === 'last' ? 'Spent Last Month' : 'Projected Spending'}
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(getDisplayTotal(), baseCurrency)}
              </p>
            </div>
            <div className="bg-red-500/10 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Remaining Budget</p>
              <p className={`text-2xl font-bold mt-1 ${remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(remainingBudget, baseCurrency)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatCurrency(remainingBudget / Math.max(dateAnalysis.daysRemaining, 1), baseCurrency)}/day
              </p>
            </div>
            <div className={`p-3 rounded-lg ${remainingBudget >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {remainingBudget >= 0 ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Daily Average</p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatCurrency(totalSpent / Math.max(dateAnalysis.daysPassed, 1), baseCurrency)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                vs {formatCurrency(totalBudget / dateAnalysis.daysInCurrentMonth, baseCurrency)} target
              </p>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Categories */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Category Budgets</h3>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const displayAmount = getDisplayAmount(budget);
            const percentage = Math.min((displayAmount / budget.budgetAmount) * 100, 100);
            const status = getBudgetStatus(budget);
            const StatusIcon = status.icon;
            const IconComponent = getCategoryIcon(budget.name);

            return (
              <div key={budget.id} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${budget.color}20` }}
                    >
                      <IconComponent
                        className="w-5 h-5"
                        style={{ color: budget.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{budget.name}</h4>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`text-xs ${status.color}`}>{status.message}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPaceColor(budget.spendingPace)} bg-gray-600`}>
                          {budget.spendingPace} pace
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        {formatCurrency(displayAmount, baseCurrency)} / {formatCurrency(budget.budgetAmount, baseCurrency)}
                      </div>
                      {budget.transactionCount > 0 && selectedPeriod === 'current' && (
                        <div className="text-xs text-gray-500">
                          {budget.transactionCount} transactions • Avg: {formatCurrency(budget.averageTransaction, baseCurrency)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(budget)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(budget.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
                  <div
                    className="h-3 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${percentage}%`,
                      backgroundColor: percentage >= 100 ? '#ef4444' : 
                                     percentage >= 80 ? '#f59e0b' : budget.color
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-400">
                    {percentage.toFixed(1)}% used
                  </span>
                  <div className="flex items-center space-x-4 text-xs">
                    {selectedPeriod === 'current' && budget.projectedSpending > budget.spentAmount && (
                      <span className="text-orange-400">
                        Projected: {formatCurrency(budget.projectedSpending, baseCurrency)}
                      </span>
                    )}
                    <span className={`font-medium ${
                      budget.budgetAmount - displayAmount >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(budget.budgetAmount - displayAmount, baseCurrency)} remaining
                    </span>
                  </div>
                </div>

                {/* Smart Advice */}
                <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-600">
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-blue-300 font-medium mb-1">Smart Advice</p>
                      <p className="text-xs text-gray-300">{status.advice}</p>
                    </div>
                  </div>
                </div>

                {/* Date-based insights */}
                {selectedPeriod === 'current' && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-400">Daily Average:</span>
                        <span className="text-white ml-2">{formatCurrency(budget.dailyAverage, baseCurrency)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Recommended Daily:</span>
                        <span className="text-green-400 ml-2">{formatCurrency(budget.recommendedDailyLimit, baseCurrency)}</span>
                      </div>
                      {budget.lastMonthSpent > 0 && (
                        <>
                          <div>
                            <span className="text-gray-400">vs Last Month:</span>
                            <div className="flex items-center space-x-1 mt-1">
                              {budget.spentAmount > budget.lastMonthSpent ? (
                                <>
                                  <TrendingUp className="w-3 h-3 text-red-400" />
                                  <span className="text-red-400">
                                    +{formatCurrency(budget.spentAmount - budget.lastMonthSpent, baseCurrency)}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="w-3 h-3 text-green-400" />
                                  <span className="text-green-400">
                                    -{formatCurrency(budget.lastMonthSpent - budget.spentAmount, baseCurrency)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Days Remaining:</span>
                            <span className="text-white ml-2">{budget.daysRemaining} days</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {budgets.length === 0 && (
            <div className="text-center py-8">
              <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Budgets Set</h3>
              <p className="text-gray-400 mb-4">
                Create your first budget to start tracking your spending limits
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Create Budget
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Budget Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingBudget ? 'Edit Budget' : 'Create New Budget'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {DEFAULT_CATEGORIES.map((category) => {
                    const IconComponent = getCategoryIcon(category.name);
                    const hasSpending = spendingData.currentByCategory[category.name];
                    const isAlreadyBudgeted = budgets.some(b => b.name === category.name && b.id !== editingBudget?.id);
                    
                    return (
                      <label
                        key={category.name}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all relative ${
                          formData.name === category.name
                            ? 'border-green-500 bg-green-500/10'
                            : isAlreadyBudgeted
                            ? 'border-gray-600 bg-gray-600/20 opacity-50 cursor-not-allowed'
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <input
                          type="radio"
                          name="category"
                          value={category.name}
                          checked={formData.name === category.name}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          disabled={isAlreadyBudgeted}
                          className="sr-only"
                        />
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <IconComponent
                            className="w-4 h-4"
                            style={{ color: category.color }}
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-300 font-medium block">
                            {category.name}
                          </span>
                          {hasSpending && (
                            <span className="text-xs text-blue-400">
                              {formatCurrency(hasSpending.total, baseCurrency)} spent
                            </span>
                          )}
                        </div>
                        {isAlreadyBudgeted && (
                          <span className="text-xs text-gray-500">Budgeted</span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monthly Budget Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.budgetAmount}
                  onChange={(e) => setFormData({ ...formData, budgetAmount: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                  required
                />
                {spendingData.currentByCategory[formData.name] && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-xs text-blue-300 space-y-1">
                      <div>Current month: {formatCurrency(spendingData.currentByCategory[formData.name].total, baseCurrency)}</div>
                      {spendingData.lastByCategory[formData.name] && (
                        <div>Last month: {formatCurrency(spendingData.lastByCategory[formData.name].total, baseCurrency)}</div>
                      )}
                      <div className="text-blue-400 font-medium">
                        Smart suggestion: {formatCurrency(Math.ceil(Math.max(
                          (spendingData.currentByCategory[formData.name].total / Math.max(dateAnalysis.daysPassed, 1)) * dateAnalysis.daysInCurrentMonth * 1.15,
                          spendingData.currentByCategory[formData.name].total * 1.2,
                          spendingData.lastByCategory[formData.name]?.total * 1.1 || 0,
                          100
                        )), baseCurrency)}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        Based on current pace: {formatCurrency((spendingData.currentByCategory[formData.name].total / Math.max(dateAnalysis.daysPassed, 1)) * dateAnalysis.daysInCurrentMonth, baseCurrency)} projected
                      </div>
                    </div>
                  </div>
                )}
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
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPlanner;