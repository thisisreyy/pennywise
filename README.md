# 🪙 PennyWise - Smart Personal Finance Tracker

<div align="center">
  <img src="public/logo.png" alt="PennyWise Logo" width="120" height="120">
  
  **Track Smarter. Spend Wiser.**
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC.svg)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.2-646CFF.svg)](https://vitejs.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

---

## 🌟 Overview

PennyWise is an AI-powered personal finance tracker that transforms your financial habits with intelligent insights and beautiful analytics. Built with modern web technologies, it offers a seamless experience for tracking expenses, managing budgets, and achieving financial goals.

### ✨ Key Highlights

- 🤖 **AI-Powered Insights** - Machine learning algorithms analyze spending patterns
- 🌍 **Multi-Currency Support** - 25+ currencies with real-time exchange rates
- 📊 **Smart Budget Planning** - Date-aware budgeting with predictive analytics
- 🎯 **Goal Tracking** - Visual progress tracking for financial milestones
- 🔒 **Secure & Private** - Local storage with user authentication
- 📱 **Responsive Design** - Beautiful UI that works on all devices

---

## 🚀 Features

### 💰 **Transaction Management**
- **Multi-Currency Transactions** - Support for 25+ global currencies
- **Smart Categorization** - 20+ predefined categories with custom icons
- **CSV Import/Export** - Bulk import from bank statements
- **Real-time Currency Conversion** - Automatic conversion with live exchange rates
- **Advanced Filtering** - Search by amount, category, date, or description

### 🧠 **AI & Machine Learning**

#### **K-Means Clustering Algorithm**
- **Spending Pattern Analysis** - Groups similar transactions automatically
- **Anomaly Detection** - Identifies unusual spending behaviors
- **Category Optimization** - Suggests budget allocations based on patterns

#### **Predictive Analytics**
- **Monthly Trend Analysis** - Forecasts future spending based on historical data
- **Budget Projections** - Predicts if you'll exceed budget limits
- **Smart Recommendations** - Personalized advice based on spending habits

#### **Natural Language Insights**
- **Contextual Advice** - Category-specific tips and recommendations
- **Progress Tracking** - Intelligent analysis of financial improvements
- **Risk Assessment** - Early warnings for budget overruns

### 📊 **Smart Budget Planner**

#### **Date-Aware Budgeting**
- **Real-time Progress Tracking** - Shows daily/weekly spending pace
- **Predictive Spending** - Forecasts month-end totals based on current pace
- **Smart Daily Limits** - Calculates recommended daily spending for remaining days
- **Month Progress Visualization** - Visual timeline of budget period

#### **Intelligent Budget Suggestions**
- **Historical Analysis** - Suggests budgets based on past spending
- **Category-Specific Advice** - Tailored recommendations per expense type
- **Spending Pace Indicators** - Visual cues for spending velocity (slow/normal/fast/critical)

#### **Advanced Analytics**
- **Weekly Breakdown** - Spending distribution across weeks
- **Variance Analysis** - Consistency tracking for each category
- **Comparative Insights** - Current vs. previous month analysis

### 🎯 **Goal Tracking**
- **Visual Progress Bars** - Beautiful progress visualization
- **Priority Management** - High/Medium/Low priority classification
- **Smart Milestones** - Automatic progress celebrations
- **Time-based Tracking** - Days remaining and deadline management
- **Quick Actions** - Fast progress updates with preset amounts

### 📈 **Advanced Analytics Dashboard**

#### **Interactive Charts**
- **Pie Charts** - Category-wise spending breakdown
- **Line Graphs** - Monthly spending trends
- **Progress Bars** - Budget utilization visualization
- **Responsive Design** - Charts adapt to screen size

#### **Key Metrics**
- **Monthly Balance** - Income vs. Expenses
- **Category Analysis** - Top spending categories
- **Trend Analysis** - Month-over-month comparisons
- **Transaction Volume** - Activity tracking

### 🔐 **User Authentication & Security**

#### **Secure Authentication System**
- **Email/Password Authentication** - Secure login with password hashing
- **Password Strength Validation** - Real-time strength indicators
- **Session Management** - Secure token-based sessions
- **Remember Me** - Extended session options

#### **Password Recovery**
- **OTP-based Reset** - Secure password reset with verification codes
- **Email Verification** - Multi-step security process
- **Session Expiry** - Automatic logout for security

#### **Data Privacy**
- **Local Storage** - All data stored locally on device
- **User Isolation** - Complete data separation between users
- **Anonymous Mode** - Use without account creation
- **Data Migration** - Seamless transition from anonymous to authenticated

---

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 18.3.1** - Modern React with hooks and concurrent features
- **TypeScript 5.5.3** - Type-safe development with enhanced IDE support
- **Vite 5.4.2** - Lightning-fast build tool and dev server

### **Styling & UI**
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **Custom Animations** - Smooth transitions and micro-interactions
- **Responsive Design** - Mobile-first approach

### **Data Visualization**
- **Recharts 2.10.3** - Composable charting library
- **Interactive Charts** - Pie charts, line graphs, and progress bars
- **Real-time Updates** - Dynamic chart updates

### **Date & Time**
- **date-fns 3.2.0** - Modern date utility library
- **Timezone Support** - Proper date handling across timezones
- **Date Calculations** - Advanced date arithmetic for budgeting

### **Development Tools**
- **ESLint** - Code quality and consistency
- **TypeScript ESLint** - TypeScript-specific linting rules
- **PostCSS** - CSS processing and optimization
- **Autoprefixer** - Automatic vendor prefixing

---

## 🤖 AI & Machine Learning Implementation

### **K-Means Clustering Algorithm**

```typescript
class KMeans {
  private k: number;
  private maxIterations: number;

  cluster(data: number[][]): { centroids: number[][]; assignments: number[] }
}
```

**Features:**
- **Automatic Pattern Recognition** - Groups similar transactions
- **Spending Behavior Analysis** - Identifies user spending patterns
- **Category Optimization** - Suggests better categorization

### **Predictive Analytics Engine**

```typescript
const analyzeSpendingPatterns = (transactions: Transaction[]): MLInsights => {
  // Advanced analytics implementation
  return {
    clusters: SpendingCluster[],
    insights: BudgetInsight[],
    monthlyTrend: number,
    topCategories: CategoryAnalysis[]
  };
};
```

**Capabilities:**
- **Trend Forecasting** - Predicts future spending patterns
- **Budget Optimization** - Suggests optimal budget allocations
- **Risk Assessment** - Identifies potential overspending

### **Natural Language Insights**

**Category-Specific Advice:**
```typescript
const categoryAdvice = {
  'Food & Dining': {
    tips: ['Meal prep on weekends', 'Use grocery store apps for coupons'],
    budgetSuggestion: 'Aim for 10-15% of your income on food expenses'
  }
  // ... more categories
};
```

**Smart Recommendations:**
- **Contextual Tips** - Advice based on spending category
- **Budget Guidelines** - Industry-standard budget percentages
- **Actionable Insights** - Specific steps to improve finances

---

## 🌍 Multi-Currency System

### **Supported Currencies (25+)**
- **Major Currencies** - USD, EUR, GBP, JPY, CAD, AUD
- **Asian Currencies** - CNY, INR, KRW, SGD, HKD, THB
- **European Currencies** - CHF, NOK, SEK, DKK, PLN, CZK, HUF
- **Emerging Markets** - BRL, MXN, ZAR, TRY, RUB

### **Real-time Exchange Rates**
- **API Integration** - Live rates from exchangerate-api.com
- **Fallback System** - Offline rates for reliability
- **Auto-refresh** - Rates updated every 24 hours
- **Conversion Accuracy** - Precise currency calculations

### **Currency Features**
- **Base Currency Selection** - Choose your primary currency
- **Transaction Currency** - Each transaction can have different currency
- **Automatic Conversion** - Real-time conversion for analysis
- **Historical Rates** - Maintains original transaction values

---

## 📱 User Experience

### **Responsive Design**
- **Mobile-First** - Optimized for mobile devices
- **Tablet Support** - Perfect layout for tablets
- **Desktop Experience** - Full-featured desktop interface
- **Touch-Friendly** - Large buttons and intuitive gestures

### **Accessibility**
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Compatible** - Proper ARIA labels
- **High Contrast** - Readable color schemes
- **Focus Management** - Clear focus indicators

### **Performance**
- **Fast Loading** - Optimized bundle size
- **Smooth Animations** - 60fps animations
- **Efficient Rendering** - React optimization techniques
- **Local Storage** - Instant data access

---

## 🔧 Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Modern web browser

### **Quick Start**

```bash
# Clone the repository
git clone https://github.com/yourusername/pennywise.git

# Navigate to project directory
cd pennywise

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### **Environment Setup**
No environment variables required! PennyWise works out of the box with:
- Local storage for data persistence
- Built-in authentication system
- Fallback exchange rates

---

## 📊 Data Architecture

### **Storage Structure**

```typescript
// User-specific storage keys
const STORAGE_KEYS = {
  transactions: `expense_tracker_data_${userId}`,
  goals: `pennywise_goals_${userId}`,
  budgets: `pennywise_budgets_${userId}`,
  currency: `expense_tracker_currency_settings`,
  auth: `pennywise_auth`
};
```

### **Data Models**

```typescript
interface Transaction {
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

interface BudgetCategory {
  id: string;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  projectedSpending: number;
  dailyAverage: number;
  recommendedDailyLimit: number;
  spendingPace: 'slow' | 'normal' | 'fast' | 'critical';
  userId?: string;
}
```

---

## 🎨 Design Philosophy

### **Visual Design**
- **Dark Theme** - Easy on the eyes, modern aesthetic
- **Gradient Accents** - Beautiful blue-to-slate gradients
- **Micro-interactions** - Smooth hover effects and transitions
- **Consistent Spacing** - 8px grid system throughout

### **User Interface**
- **Intuitive Navigation** - Clear, logical menu structure
- **Visual Hierarchy** - Important information stands out
- **Progressive Disclosure** - Complex features revealed gradually
- **Feedback Systems** - Clear success/error states

### **Color System**
- **Primary** - Blue gradient (#3b82f6 to #64748b)
- **Success** - Green (#10b981)
- **Warning** - Yellow (#f59e0b)
- **Error** - Red (#ef4444)
- **Neutral** - Gray scale (#1f2937 to #f9fafb)

---

## 🚀 Future Roadmap

### **Planned Features**
- [ ] **Bank Integration** - Connect to bank accounts via API
- [ ] **Investment Tracking** - Portfolio management features
- [ ] **Bill Reminders** - Automated payment notifications
- [ ] **Expense Splitting** - Share expenses with friends/family
- [ ] **Advanced Reports** - PDF export and detailed analytics
- [ ] **Mobile App** - React Native mobile application

### **AI Enhancements**
- [ ] **Expense Prediction** - Predict future expenses
- [ ] **Smart Categorization** - Auto-categorize transactions
- [ ] **Fraud Detection** - Identify suspicious transactions
- [ ] **Financial Coaching** - Personalized financial advice

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Process**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Code Standards**
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Conventional commits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aatreyee Chatterjee**
- Email: [aatreyeechatterjeee@gmail.com]
- GitHub: [@thisisreyy]
- LinkedIn: [(https://www.linkedin.com/in/aatreyee-chatterjee/)]

---

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icons
- **Recharts** - For the charting library
- **ExchangeRate-API** - For currency exchange rates

---

<div align="center">
  <p>Made with ❤️ by Aatreyee Chatterjee</p>
  <p>© 2025 PennyWise. All rights reserved.</p>
</div>
