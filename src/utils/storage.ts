import { Transaction, CurrencySettings } from '../types';
import { loadCurrencySettings, convertCurrency } from './currencyService';
import { getCurrentUser } from './auth';

const STORAGE_KEY = 'expense_tracker_data';
const GOALS_STORAGE_KEY = 'pennywise_goals';
const BUDGETS_STORAGE_KEY = 'pennywise_budgets';

// Get user-specific storage key
const getUserStorageKey = (baseKey: string, userId?: string): string => {
  const currentUser = getCurrentUser();
  const userIdToUse = userId || currentUser?.id;
  return userIdToUse ? `${baseKey}_${userIdToUse}` : baseKey;
};

// Transaction storage functions
export const loadTransactions = (userId?: string): Transaction[] => {
  try {
    const storageKey = getUserStorageKey(STORAGE_KEY, userId);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[], userId?: string): void => {
  try {
    const storageKey = getUserStorageKey(STORAGE_KEY, userId);
    const currentUser = getCurrentUser();
    
    // Add userId to transactions if user is authenticated
    const transactionsWithUserId = currentUser 
      ? transactions.map(t => ({ ...t, userId: currentUser.id }))
      : transactions;
    
    localStorage.setItem(storageKey, JSON.stringify(transactionsWithUserId));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>, userId?: string): Transaction => {
  const transactions = loadTransactions(userId);
  const currentUser = getCurrentUser();
  
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
    currency: transaction.currency || 'USD',
    userId: currentUser?.id
  };
  
  transactions.push(newTransaction);
  saveTransactions(transactions, userId);
  return newTransaction;
};

export const deleteTransaction = (id: string, userId?: string): void => {
  const transactions = loadTransactions(userId);
  const filteredTransactions = transactions.filter(t => t.id !== id);
  saveTransactions(filteredTransactions, userId);
};

export const updateTransaction = (id: string, updates: Partial<Transaction>, userId?: string): void => {
  const transactions = loadTransactions(userId);
  const index = transactions.findIndex(t => t.id === id);
  
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions, userId);
  }
};

// Goals storage functions
export const loadGoals = (userId?: string): any[] => {
  try {
    const storageKey = getUserStorageKey(GOALS_STORAGE_KEY, userId);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading goals:', error);
    return [];
  }
};

export const saveGoals = (goals: any[], userId?: string): void => {
  try {
    const storageKey = getUserStorageKey(GOALS_STORAGE_KEY, userId);
    const currentUser = getCurrentUser();
    
    // Add userId to goals if user is authenticated
    const goalsWithUserId = currentUser 
      ? goals.map(g => ({ ...g, userId: currentUser.id }))
      : goals;
    
    localStorage.setItem(storageKey, JSON.stringify(goalsWithUserId));
  } catch (error) {
    console.error('Error saving goals:', error);
  }
};

// Budget storage functions
export const loadBudgets = (userId?: string): any[] => {
  try {
    const storageKey = getUserStorageKey(BUDGETS_STORAGE_KEY, userId);
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudgets = (budgets: any[], userId?: string): void => {
  try {
    const storageKey = getUserStorageKey(BUDGETS_STORAGE_KEY, userId);
    const currentUser = getCurrentUser();
    
    // Add userId to budgets if user is authenticated
    const budgetsWithUserId = currentUser 
      ? budgets.map(b => ({ ...b, userId: currentUser.id }))
      : budgets;
    
    localStorage.setItem(storageKey, JSON.stringify(budgetsWithUserId));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
};

// Convert all transactions to a specific currency for analysis
export const getTransactionsInCurrency = (
  transactions: Transaction[],
  targetCurrency: string,
  currencySettings?: CurrencySettings
): Transaction[] => {
  const settings = currencySettings || loadCurrencySettings();
  
  return transactions.map(transaction => {
    if (transaction.currency === targetCurrency) {
      return transaction;
    }

    const convertedAmount = convertCurrency(
      transaction.amount,
      transaction.currency || 'USD',
      targetCurrency,
      settings.exchangeRates
    );

    return {
      ...transaction,
      amount: convertedAmount,
      originalAmount: transaction.amount,
      originalCurrency: transaction.currency || 'USD',
      currency: targetCurrency
    };
  });
};

// Migrate data when user signs in (merge anonymous data with user data)
export const migrateAnonymousData = (userId: string): void => {
  try {
    // Migrate transactions
    const anonymousTransactions = localStorage.getItem(STORAGE_KEY);
    if (anonymousTransactions) {
      const transactions: Transaction[] = JSON.parse(anonymousTransactions);
      if (transactions.length > 0) {
        const userTransactions = loadTransactions(userId);
        const migratedTransactions = transactions.map(t => ({ ...t, userId }));
        const allTransactions = [...userTransactions, ...migratedTransactions];
        
        // Remove duplicates based on id
        const uniqueTransactions = allTransactions.filter((transaction, index, self) =>
          index === self.findIndex(t => t.id === transaction.id)
        );

        saveTransactions(uniqueTransactions, userId);
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // Migrate goals
    const anonymousGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (anonymousGoals) {
      const goals: any[] = JSON.parse(anonymousGoals);
      if (goals.length > 0) {
        const userGoals = loadGoals(userId);
        const migratedGoals = goals.map(g => ({ ...g, userId }));
        const allGoals = [...userGoals, ...migratedGoals];
        
        // Remove duplicates based on id
        const uniqueGoals = allGoals.filter((goal, index, self) =>
          index === self.findIndex(g => g.id === goal.id)
        );

        saveGoals(uniqueGoals, userId);
        localStorage.removeItem(GOALS_STORAGE_KEY);
      }
    }

    // Migrate budgets
    const anonymousBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
    if (anonymousBudgets) {
      const budgets: any[] = JSON.parse(anonymousBudgets);
      if (budgets.length > 0) {
        const userBudgets = loadBudgets(userId);
        const migratedBudgets = budgets.map(b => ({ ...b, userId }));
        const allBudgets = [...userBudgets, ...migratedBudgets];
        
        // Remove duplicates based on id
        const uniqueBudgets = allBudgets.filter((budget, index, self) =>
          index === self.findIndex(b => b.id === budget.id)
        );

        saveBudgets(uniqueBudgets, userId);
        localStorage.removeItem(BUDGETS_STORAGE_KEY);
      }
    }
  } catch (error) {
    console.error('Error migrating anonymous data:', error);
  }
};