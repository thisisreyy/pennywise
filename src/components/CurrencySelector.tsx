import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Check } from 'lucide-react';
import { SUPPORTED_CURRENCIES, getCurrencyFlag } from '../constants/currencies';
import { CurrencySettings } from '../types';
import { loadCurrencySettings, updateExchangeRates } from '../utils/currencyService';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  onSettingsUpdate?: (settings: CurrencySettings) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencyChange,
  onSettingsUpdate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const settings = loadCurrencySettings();
    setLastUpdated(settings.lastUpdated);
  }, []);

  const handleCurrencySelect = async (currencyCode: string) => {
    setIsOpen(false);
    onCurrencyChange(currencyCode);
    
    // Update exchange rates for the new base currency
    setIsUpdating(true);
    try {
      const updatedSettings = await updateExchangeRates(currencyCode);
      setLastUpdated(updatedSettings.lastUpdated);
      onSettingsUpdate?.(updatedSettings);
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshRates = async () => {
    setIsUpdating(true);
    try {
      const updatedSettings = await updateExchangeRates(selectedCurrency);
      setLastUpdated(updatedSettings.lastUpdated);
      onSettingsUpdate?.(updatedSettings);
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const selectedCurrencyData = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrency);
  const formatLastUpdated = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffHours < 1) return 'Just updated';
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white hover:bg-gray-600 transition-colors text-xs"
      >
        <Globe className="w-3 h-3" />
        <span className="text-sm">{getCurrencyFlag(selectedCurrency)}</span>
        <span className="font-medium">{selectedCurrency}</span>
        <span className="text-gray-400">|</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRefreshRates();
          }}
          disabled={isUpdating}
          className="p-0.5 hover:bg-gray-500 rounded transition-colors"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${isUpdating ? 'animate-spin' : ''}`} />
        </button>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white text-sm">Select Currency</h3>
              <span className="text-xs text-gray-400">
                {formatLastUpdated(lastUpdated)}
              </span>
            </div>
          </div>
          
          <div className="p-1">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <button
                key={currency.code}
                onClick={() => handleCurrencySelect(currency.code)}
                className={`w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-700 transition-colors text-xs ${
                  selectedCurrency === currency.code ? 'bg-blue-600/20 border border-blue-500/30' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{currency.flag}</span>
                  <div className="text-left">
                    <div className="font-medium text-white">{currency.code}</div>
                    <div className="text-xs text-gray-400 truncate max-w-32">{currency.name}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-400 text-xs">{currency.symbol}</span>
                  {selectedCurrency === currency.code && (
                    <Check className="w-3 h-3 text-blue-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;