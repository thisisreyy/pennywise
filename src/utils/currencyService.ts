import { ExchangeRates, CurrencySettings } from '../types';

const CURRENCY_STORAGE_KEY = 'expense_tracker_currency_settings';
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/';

// Fallback exchange rates (approximate values for offline use)
const FALLBACK_RATES: ExchangeRates = {
  'USD': 1,
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110,
  'CAD': 1.25,
  'AUD': 1.35,
  'CHF': 0.92,
  'CNY': 6.45,
  'INR': 74.5,
  'KRW': 1180,
  'SGD': 1.35,
  'HKD': 7.8,
  'NOK': 8.5,
  'SEK': 8.7,
  'DKK': 6.3,
  'PLN': 3.9,
  'CZK': 21.5,
  'HUF': 295,
  'RUB': 73,
  'BRL': 5.2,
  'MXN': 20,
  'ZAR': 14.5,
  'TRY': 8.5,
  'NZD': 1.4,
  'THB': 31.5
};

export const loadCurrencySettings = (): CurrencySettings => {
  try {
    const data = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (data) {
      const settings = JSON.parse(data);
      // Check if rates are older than 24 hours
      const lastUpdated = new Date(settings.lastUpdated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return settings;
      }
    }
  } catch (error) {
    console.error('Error loading currency settings:', error);
  }

  // Return default settings with fallback rates
  return {
    baseCurrency: 'USD',
    exchangeRates: FALLBACK_RATES,
    lastUpdated: new Date().toISOString()
  };
};

export const saveCurrencySettings = (settings: CurrencySettings): void => {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving currency settings:', error);
  }
};

export const fetchExchangeRates = async (baseCurrency: string = 'USD'): Promise<ExchangeRates> => {
  try {
    const response = await fetch(`${EXCHANGE_API_URL}${baseCurrency}`);
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }
    
    const data = await response.json();
    return data.rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    // Return fallback rates adjusted for the base currency
    if (baseCurrency === 'USD') {
      return FALLBACK_RATES;
    } else {
      // Convert fallback rates to the requested base currency
      const usdRate = FALLBACK_RATES[baseCurrency];
      if (usdRate) {
        const adjustedRates: ExchangeRates = {};
        Object.entries(FALLBACK_RATES).forEach(([currency, rate]) => {
          adjustedRates[currency] = rate / usdRate;
        });
        return adjustedRates;
      }
    }
    return FALLBACK_RATES;
  }
};

export const updateExchangeRates = async (baseCurrency: string): Promise<CurrencySettings> => {
  const rates = await fetchExchangeRates(baseCurrency);
  const settings: CurrencySettings = {
    baseCurrency,
    exchangeRates: rates,
    lastUpdated: new Date().toISOString()
  };
  
  saveCurrencySettings(settings);
  return settings;
};

export const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRates: ExchangeRates
): number => {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = exchangeRates[fromCurrency] || 1;
  const toRate = exchangeRates[toCurrency] || 1;
  
  // Convert to base currency first, then to target currency
  const baseAmount = amount / fromRate;
  return baseAmount * toRate;
};

export const formatCurrency = (amount: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2,
      maximumFractionDigits: currencyCode === 'JPY' || currencyCode === 'KRW' ? 0 : 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting if currency is not supported by Intl
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toFixed(2)}`;
  }
};

const getCurrencySymbol = (code: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CAD': 'C$',
    'AUD': 'A$', 'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'KRW': '₩',
    'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr', 'SEK': 'kr', 'DKK': 'kr',
    'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RUB': '₽', 'BRL': 'R$',
    'MXN': '$', 'ZAR': 'R', 'TRY': '₺', 'NZD': 'NZ$', 'THB': '฿'
  };
  return symbols[code] || code;
};