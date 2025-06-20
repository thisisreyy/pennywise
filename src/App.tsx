import React, { useState, useEffect } from 'react';
import { Plus, BarChart3, List, Brain, Upload, Menu, X, LogOut, User as UserIcon, Target, Calculator } from 'lucide-react';
import { Transaction, CurrencySettings, User } from './types';
import { loadTransactions, saveTransactions, addTransaction, deleteTransaction, updateTransaction, migrateAnonymousData } from './utils/storage';
import { analyzeSpendingPatterns } from './utils/mlAnalyzer';
import { loadCurrencySettings, updateExchangeRates } from './utils/currencyService';
import { useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import BudgetTips from './components/BudgetTips';
import CSVUpload from './components/CSVUpload';
import EditTransactionModal from './components/EditTransactionModal';
import CurrencySelector from './components/CurrencySelector';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import GoalsTracker from './components/GoalsTracker';
import BudgetPlanner from './components/BudgetPlanner';
import Footer from './components/Footer';

type ActiveView = 'dashboard' | 'transactions' | 'budget-tips' | 'csv-upload' | 'goals' | 'budget-planner';

function App() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [mlInsights, setMlInsights] = useState<any>({ clusters: [], insights: [], monthlyTrend: 0, topCategories: [] });
  const [currencySettings, setCurrencySettings] = useState<CurrencySettings>(() => loadCurrencySettings());
  const [baseCurrency, setBaseCurrency] = useState<string>(currencySettings.baseCurrency);

  // Load transactions when user changes or component mounts
  useEffect(() => {
    if (!isLoading) {
      const savedTransactions = loadTransactions(user?.id);
      setTransactions(savedTransactions);
    }
  }, [user?.id, isLoading]);

  useEffect(() => {
    const insights = analyzeSpendingPatterns(transactions);
    setMlInsights(insights);
  }, [transactions]);

  useEffect(() => {
    // Update exchange rates on app load if they're stale
    const initializeCurrency = async () => {
      try {
        const settings = await updateExchangeRates(baseCurrency);
        setCurrencySettings(settings);
      } catch (error) {
        console.error('Failed to initialize currency settings:', error);
      }
    };

    initializeCurrency();
  }, []);

  const handleEnterApp = (authenticatedUser?: User) => {
    if (authenticatedUser) {
      // User signed in, migrate any anonymous data
      migrateAnonymousData(authenticatedUser.id);
      signIn(authenticatedUser);
    }
    setShowLanding(false);
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    migrateAnonymousData(authenticatedUser.id);
    signIn(authenticatedUser);
    setShowAuthModal(false);
  };

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    setShowLanding(true);
    setTransactions([]);
  };

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction = addTransaction(transactionData, user?.id);
    setTransactions(prev => [...prev, newTransaction]);
    setShowTransactionForm(false);
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id, user?.id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateTransaction = (id: string, updates: Partial<Transaction>) => {
    updateTransaction(id, updates, user?.id);
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTransaction(null);
  };

  const handleCSVImport = (importedTransactions: Transaction[]) => {
    const updatedTransactions = [...transactions, ...importedTransactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions, user?.id);
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setBaseCurrency(newCurrency);
  };

  const handleCurrencySettingsUpdate = (settings: CurrencySettings) => {
    setCurrencySettings(settings);
    setBaseCurrency(settings.baseCurrency);
  };

  const navigationItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'transactions', icon: List, label: 'Transactions' },
    { id: 'budget-planner', icon: Calculator, label: 'Budget' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'budget-tips', icon: Brain, label: 'AI Tips' },
    { id: 'csv-upload', icon: Upload, label: 'Import' },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            transactions={transactions} 
            baseCurrency={baseCurrency}
            currencySettings={currencySettings}
          />
        );
      case 'transactions':
        return (
          <TransactionList
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            onEdit={setEditingTransaction}
            baseCurrency={baseCurrency}
            currencySettings={currencySettings}
          />
        );
      case 'budget-planner':
        return (
          <BudgetPlanner
            transactions={transactions}
            baseCurrency={baseCurrency}
            currencySettings={currencySettings}
          />
        );
      case 'goals':
        return (
          <GoalsTracker
            baseCurrency={baseCurrency}
          />
        );
      case 'budget-tips':
        return (
          <BudgetTips 
            insights={mlInsights} 
            baseCurrency={baseCurrency}
            currencySettings={currencySettings}
          />
        );
      case 'csv-upload':
        return <CSVUpload onImport={handleCSVImport} />;
      default:
        return (
          <Dashboard 
            transactions={transactions} 
            baseCurrency={baseCurrency}
            currencySettings={currencySettings}
          />
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo.png" alt="PennyWise" className="h-16 w-auto mx-auto mb-4 animate-pulse" />
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="PennyWise Logo" 
                className="h-10 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as ActiveView)}
                    className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              {/* Currency Selector */}
              <CurrencySelector
                selectedCurrency={baseCurrency}
                onCurrencyChange={handleCurrencyChange}
                onSettingsUpdate={handleCurrencySettingsUpdate}
              />

              <button
                onClick={() => setShowTransactionForm(true)}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Add</span>
              </button>

              {/* User Menu */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors text-sm"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="hidden sm:inline max-w-20 truncate">{user.email}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="p-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white hover:bg-gray-600 transition-colors text-sm"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden text-gray-300 hover:text-white p-2"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="lg:hidden py-3 border-t border-gray-700">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id as ActiveView);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeView === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      {showTransactionForm && (
        <TransactionForm
          onAdd={handleAddTransaction}
          onClose={() => setShowTransactionForm(false)}
          defaultCurrency={baseCurrency}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onSave={handleUpdateTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}

export default App;