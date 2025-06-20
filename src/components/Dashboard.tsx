import React, { useMemo } from 'react';
import { Transaction, CurrencySettings } from '../types';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../constants/categories';
import { formatCurrency } from '../utils/currencyService';
import { getTransactionsInCurrency } from '../utils/storage';

interface DashboardProps {
  transactions: Transaction[];
  baseCurrency: string;
  currencySettings: CurrencySettings;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, baseCurrency, currencySettings }) => {
  const stats = useMemo(() => {
    // Convert all transactions to base currency for analysis
    const convertedTransactions = getTransactionsInCurrency(transactions, baseCurrency, currencySettings);
    
    const currentMonth = new Date();
    const currentMonthTransactions = convertedTransactions.filter(t => 
      isWithinInterval(new Date(t.date), {
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      })
    );

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Category breakdown
    const categoryData = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category)
    }));

    // Monthly trend data
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthTransactions = convertedTransactions.filter(t => 
        isWithinInterval(new Date(t.date), {
          start: startOfMonth(date),
          end: endOfMonth(date)
        })
      );

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: format(date, 'MMM'),
        expenses: monthExpenses,
        income: monthIncome,
        balance: monthIncome - monthExpenses
      });
    }

    return {
      totalExpenses,
      totalIncome,
      balance,
      transactionCount: currentMonthTransactions.length,
      pieData,
      monthlyData,
      convertedTransactions
    };
  }, [transactions, baseCurrency, currencySettings]);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Expenses</p>
              <p className="text-xl font-bold text-white mt-1">
                {formatCurrency(stats.totalExpenses, baseCurrency)}
              </p>
            </div>
            <div className="bg-red-500/10 p-2 rounded-lg">
              <CreditCard className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Total Income</p>
              <p className="text-xl font-bold text-white mt-1">
                {formatCurrency(stats.totalIncome, baseCurrency)}
              </p>
            </div>
            <div className="bg-green-500/10 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Balance</p>
              <p className={`text-xl font-bold mt-1 ${stats.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(stats.balance, baseCurrency)}
              </p>
            </div>
            <div className={`p-2 rounded-lg ${stats.balance >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              {stats.balance >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">Transactions</p>
              <p className="text-xl font-bold text-white mt-1">
                {stats.transactionCount}
              </p>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Category Breakdown */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Spending by Category</h3>
          {stats.pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {stats.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value, baseCurrency), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#374151',
                      border: '1px solid #4B5563',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              <p>No spending data available</p>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => formatCurrency(value, baseCurrency)} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value, baseCurrency), '']}
                  contentStyle={{
                    backgroundColor: '#374151',
                    border: '1px solid #4B5563',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                  dot={{ fill: '#ef4444', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Income"
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Recent Transactions</h3>
        <div className="space-y-2">
          {stats.convertedTransactions.slice(0, 5).map((transaction) => {
            const IconComponent = getCategoryIcon(transaction.category);
            return (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                  >
                    <IconComponent
                      className="w-4 h-4"
                      style={{ color: getCategoryColor(transaction.category) }}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm">{transaction.description}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                      {transaction.originalCurrency && transaction.originalCurrency !== baseCurrency && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400">
                            {formatCurrency(transaction.originalAmount || 0, transaction.originalCurrency)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <p className={`font-semibold text-sm ${transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount, baseCurrency)}
                </p>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div className="text-center py-6 text-gray-400">
              <p>No transactions yet. Add your first transaction to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;