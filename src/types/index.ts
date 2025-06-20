export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: 'expense' | 'income';
  currency: string;
  originalAmount?: number;
  originalCurrency?: string;
  userId?: string;
}

export interface Category {
  name: string;
  color: string;
  icon: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface BudgetInsight {
  id: string;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  category?: string;
  percentage?: number;
  recommendation?: string;
}

export interface SpendingCluster {
  centroid: number[];
  category: string;
  transactions: Transaction[];
  average: number;
  variance: number;
}

export interface MLInsights {
  clusters: SpendingCluster[];
  insights: BudgetInsight[];
  monthlyTrend: number;
  topCategories: { category: string; amount: number; percentage: number }[];
}

export interface ExchangeRates {
  [key: string]: number;
}

export interface CurrencySettings {
  baseCurrency: string;
  exchangeRates: ExchangeRates;
  lastUpdated: string;
}

export interface User {
  id: string;
  email: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}