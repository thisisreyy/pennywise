import React, { useState, useMemo } from 'react';
import { Transaction, CurrencySettings } from '../types';
import { format } from 'date-fns';
import { Search, Filter, Trash2, Edit3 } from 'lucide-react';
import { getCategoryColor, getCategoryIcon } from '../constants/categories';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { formatCurrency } from '../utils/currencyService';
import { getTransactionsInCurrency } from '../utils/storage';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  baseCurrency: string;
  currencySettings: CurrencySettings;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onDelete, 
  onEdit, 
  baseCurrency,
  currencySettings 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');

  const convertedTransactions = useMemo(() => {
    return getTransactionsInCurrency(transactions, baseCurrency, currencySettings);
  }, [transactions, baseCurrency, currencySettings]);

  const filteredTransactions = useMemo(() => {
    return convertedTransactions.filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || transaction.category === filterCategory;
      const matchesType = filterType === 'all' || transaction.type === filterType;
      
      return matchesSearch && matchesCategory && matchesType;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [convertedTransactions, searchTerm, filterCategory, filterType]);

  const totalAmount = filteredTransactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {DEFAULT_CATEGORIES.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'expense' | 'income')}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-gray-400">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <p className={`font-semibold ${totalAmount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Total: {formatCurrency(totalAmount, baseCurrency)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-700">
            {filteredTransactions.map((transaction) => {
              const IconComponent = getCategoryIcon(transaction.category);
              const originalTransaction = transactions.find(t => t.id === transaction.id);
              
              return (
                <div key={transaction.id} className="p-3 hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
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
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-white text-sm">{transaction.description}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            transaction.type === 'expense' 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400 mt-0.5">
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

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${
                          transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {transaction.type === 'expense' ? '-' : '+'}
                          {formatCurrency(transaction.amount, baseCurrency)}
                        </span>
                        {transaction.originalCurrency && transaction.originalCurrency !== baseCurrency && (
                          <div className="text-xs text-gray-500">
                            Converted from {transaction.originalCurrency}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onEdit(originalTransaction || transaction)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDelete(transaction.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-400">
            <Filter className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium mb-1">No transactions found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;