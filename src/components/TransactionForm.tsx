import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Transaction } from '../types';
import { DEFAULT_CATEGORIES, getCategoryIcon, getCategoryColor } from '../constants/categories';
import { SUPPORTED_CURRENCIES, getCurrencyFlag } from '../constants/currencies';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  defaultCurrency?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose, defaultCurrency = 'USD' }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: DEFAULT_CATEGORIES[0].name,
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'expense' | 'income',
    currency: defaultCurrency
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      return;
    }

    onAdd({
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      type: formData.type,
      currency: formData.currency
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Add Transaction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })}
                  className="mr-2 text-red-400"
                />
                <span className="text-gray-300">Expense</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'expense' | 'income' })}
                  className="mr-2 text-green-400"
                />
                <span className="text-gray-300">Income</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {getCurrencyFlag(currency.code)} {currency.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {DEFAULT_CATEGORIES.map((category) => {
                const IconComponent = getCategoryIcon(category.name);
                return (
                  <label
                    key={category.name}
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.category === category.name
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.name}
                      checked={formData.category === category.name}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                    <span className="text-sm text-gray-300 font-medium">
                      {category.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter description"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;