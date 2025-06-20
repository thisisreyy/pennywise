import { Transaction, BudgetInsight, MLInsights, SpendingCluster } from '../types';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

// Simple KMeans clustering implementation
class KMeans {
  private k: number;
  private maxIterations: number;

  constructor(k: number = 3, maxIterations: number = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
  }

  private distance(point1: number[], point2: number[]): number {
    return Math.sqrt(
      point1.reduce((sum, val, i) => sum + Math.pow(val - point2[i], 2), 0)
    );
  }

  private getRandomCentroids(data: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    const dimensions = data[0].length;
    
    for (let i = 0; i < k; i++) {
      const centroid: number[] = [];
      for (let j = 0; j < dimensions; j++) {
        const values = data.map(point => point[j]);
        const min = Math.min(...values);
        const max = Math.max(...values);
        centroid.push(Math.random() * (max - min) + min);
      }
      centroids.push(centroid);
    }
    
    return centroids;
  }

  cluster(data: number[][]): { centroids: number[][]; assignments: number[] } {
    if (data.length === 0) return { centroids: [], assignments: [] };
    
    let centroids = this.getRandomCentroids(data, Math.min(this.k, data.length));
    let assignments: number[] = new Array(data.length);
    
    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      // Assign points to closest centroid
      const newAssignments = data.map(point => {
        let closestCentroid = 0;
        let minDistance = this.distance(point, centroids[0]);
        
        for (let i = 1; i < centroids.length; i++) {
          const distance = this.distance(point, centroids[i]);
          if (distance < minDistance) {
            minDistance = distance;
            closestCentroid = i;
          }
        }
        
        return closestCentroid;
      });
      
      // Check for convergence
      if (JSON.stringify(assignments) === JSON.stringify(newAssignments)) {
        break;
      }
      
      assignments = newAssignments;
      
      // Update centroids
      const newCentroids: number[][] = [];
      for (let i = 0; i < centroids.length; i++) {
        const clusterPoints = data.filter((_, index) => assignments[index] === i);
        if (clusterPoints.length > 0) {
          const centroid = clusterPoints[0].map((_, dimIndex) =>
            clusterPoints.reduce((sum, point) => sum + point[dimIndex], 0) / clusterPoints.length
          );
          newCentroids.push(centroid);
        } else {
          newCentroids.push(centroids[i]);
        }
      }
      
      centroids = newCentroids;
    }
    
    return { centroids, assignments };
  }
}

export const analyzeSpendingPatterns = (transactions: Transaction[]): MLInsights => {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    return {
      clusters: [],
      insights: [],
      monthlyTrend: 0,
      topCategories: []
    };
  }

  // Group transactions by category
  const categoryGroups = expenses.reduce((acc, transaction) => {
    if (!acc[transaction.category]) {
      acc[transaction.category] = [];
    }
    acc[transaction.category].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  // Prepare data for clustering (amount, day of month, category encoded)
  const categories = Object.keys(categoryGroups);
  const categoryMap = categories.reduce((acc, cat, index) => {
    acc[cat] = index;
    return acc;
  }, {} as Record<string, number>);

  const dataPoints = expenses.map(transaction => [
    transaction.amount,
    new Date(transaction.date).getDate(),
    categoryMap[transaction.category] || 0
  ]);

  // Perform clustering
  const kmeans = new KMeans(Math.min(3, categories.length));
  const { centroids, assignments } = kmeans.cluster(dataPoints);

  // Create clusters with better analysis
  const clusters: SpendingCluster[] = centroids.map((centroid, index) => {
    const clusterTransactions = expenses.filter((_, i) => assignments[i] === index);
    const amounts = clusterTransactions.map(t => t.amount);
    const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length || 0;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - average, 2), 0) / amounts.length || 0;
    
    return {
      centroid,
      category: clusterTransactions[0]?.category || 'Unknown',
      transactions: clusterTransactions,
      average,
      variance
    };
  });

  // Generate enhanced insights with actionable advice
  const insights = generateEnhancedInsights(expenses, clusters, categoryGroups);
  
  // Calculate monthly trend
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  const currentMonthExpenses = expenses.filter(t => 
    isWithinInterval(new Date(t.date), {
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    })
  );
  const lastMonthExpenses = expenses.filter(t => 
    isWithinInterval(new Date(t.date), {
      start: startOfMonth(lastMonth),
      end: endOfMonth(lastMonth)
    })
  );

  const currentTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const lastTotal = lastMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const monthlyTrend = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

  // Top categories
  const categoryTotals = Object.entries(categoryGroups).map(([category, transactions]) => ({
    category,
    amount: transactions.reduce((sum, t) => sum + t.amount, 0),
    percentage: 0
  }));

  const totalAmount = categoryTotals.reduce((sum, cat) => sum + cat.amount, 0);
  const topCategories = categoryTotals
    .map(cat => ({ ...cat, percentage: (cat.amount / totalAmount) * 100 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  return {
    clusters,
    insights,
    monthlyTrend,
    topCategories
  };
};

const generateEnhancedInsights = (
  transactions: Transaction[], 
  clusters: SpendingCluster[], 
  categoryGroups: Record<string, Transaction[]>
): BudgetInsight[] => {
  const insights: BudgetInsight[] = [];
  const usedCategories = new Set<string>();
  
  if (clusters.length === 0) return insights;

  // Calculate overall spending statistics
  const allAmounts = transactions.map(t => t.amount);
  const overallAverage = allAmounts.reduce((sum, amount) => sum + amount, 0) / allAmounts.length;
  const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Category-specific advice mapping
  const categoryAdvice: Record<string, { tips: string[]; budgetSuggestion: string }> = {
    'Food & Dining': {
      tips: ['Meal prep on weekends', 'Use grocery store apps for coupons', 'Cook at home 4-5 times per week'],
      budgetSuggestion: 'Aim for 10-15% of your income on food expenses'
    },
    'Transportation': {
      tips: ['Use public transport when possible', 'Carpool or use ride-sharing', 'Maintain your vehicle regularly'],
      budgetSuggestion: 'Transportation should be 15-20% of your budget'
    },
    'Shopping': {
      tips: ['Wait 24 hours before non-essential purchases', 'Use price comparison apps', 'Set a monthly shopping limit'],
      budgetSuggestion: 'Limit discretionary shopping to 5-10% of income'
    },
    'Entertainment': {
      tips: ['Look for free local events', 'Use streaming services instead of movie theaters', 'Set a monthly entertainment budget'],
      budgetSuggestion: 'Entertainment should be 5-10% of your budget'
    },
    'Bills & Utilities': {
      tips: ['Review and negotiate bills annually', 'Use energy-efficient appliances', 'Bundle services for discounts'],
      budgetSuggestion: 'Utilities should be 8-12% of your income'
    },
    'Healthcare': {
      tips: ['Use preventive care to avoid larger costs', 'Compare prices for procedures', 'Use generic medications when possible'],
      budgetSuggestion: 'Budget 5-10% for healthcare expenses'
    }
  };

  // Analyze each category for enhanced insights
  Object.entries(categoryGroups).forEach(([category, categoryTransactions]) => {
    if (usedCategories.has(category) || categoryTransactions.length < 2) return;

    const amounts = categoryTransactions.map(t => t.amount);
    const categoryTotal = amounts.reduce((sum, amount) => sum + amount, 0);
    const categoryAverage = categoryTotal / amounts.length;
    const categoryPercentage = (categoryTotal / totalSpending) * 100;
    const categoryVariance = amounts.reduce((sum, amount) => sum + Math.pow(amount - categoryAverage, 2), 0) / amounts.length;
    const coefficientOfVariation = categoryAverage > 0 ? Math.sqrt(categoryVariance) / categoryAverage : 0;

    // Get category-specific advice
    const advice = categoryAdvice[category] || {
      tips: ['Track expenses carefully', 'Set monthly limits', 'Review spending regularly'],
      budgetSuggestion: 'Monitor this category closely'
    };

    // Enhanced analysis with specific thresholds
    const isHighSpending = categoryPercentage > 25; // More than 25% of total spending
    const isModerateSpending = categoryPercentage > 15 && categoryPercentage <= 25;
    const isConsistent = coefficientOfVariation < 0.3;
    const isVariable = coefficientOfVariation > 0.6;

    // Generate insights with actionable advice
    if (isHighSpending && !isConsistent) {
      insights.push({
        id: `high-variable-${category}-${Date.now()}`,
        type: 'warning',
        title: `${category} Needs Attention`,
        description: `This category represents ${categoryPercentage.toFixed(1)}% of your spending and varies significantly`,
        category,
        percentage: Math.round(categoryPercentage),
        recommendation: `${advice.budgetSuggestion}. Try these strategies: ${advice.tips.slice(0, 2).join(', ')}.`
      });
      usedCategories.add(category);
    } else if (isHighSpending && isConsistent) {
      insights.push({
        id: `high-consistent-${category}-${Date.now()}`,
        type: 'info',
        title: `${category} is Your Major Expense`,
        description: `This category is ${categoryPercentage.toFixed(1)}% of your spending but remains consistent`,
        category,
        percentage: Math.round(categoryPercentage),
        recommendation: `Since this is a major expense, consider: ${advice.tips[0]}. ${advice.budgetSuggestion}.`
      });
      usedCategories.add(category);
    } else if (isModerateSpending && isVariable) {
      insights.push({
        id: `moderate-variable-${category}-${Date.now()}`,
        type: 'info',
        title: `${category} Spending Fluctuates`,
        description: `Your ${category} expenses vary significantly month to month`,
        category,
        percentage: Math.round(coefficientOfVariation * 100),
        recommendation: `Set a monthly budget of $${Math.round(categoryAverage * 1.2)} for ${category}. ${advice.tips[2] || advice.tips[0]}.`
      });
      usedCategories.add(category);
    } else if (!isHighSpending && isConsistent && categoryPercentage > 5) {
      insights.push({
        id: `well-managed-${category}-${Date.now()}`,
        type: 'success',
        title: `${category} is Well-Managed`,
        description: `Your ${category} spending is consistent and reasonable at ${categoryPercentage.toFixed(1)}% of total expenses`,
        category,
        percentage: Math.round((1 - coefficientOfVariation) * 100),
        recommendation: `Great job! Keep maintaining this spending pattern. ${advice.budgetSuggestion}.`
      });
      usedCategories.add(category);
    }
  });

  // Overall spending pattern insights
  if (insights.length < 2) {
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, Math.min(10, Math.floor(transactions.length * 0.3)));

    if (recentTransactions.length >= 3) {
      const recentAverage = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
      const historicalAverage = transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length;

      if (recentAverage > historicalAverage * 1.25) {
        insights.push({
          id: `recent-increase-${Date.now()}`,
          type: 'warning',
          title: 'Recent Spending Spike',
          description: `Your recent spending is ${Math.round(((recentAverage - historicalAverage) / historicalAverage) * 100)}% higher than usual`,
          percentage: Math.round(((recentAverage - historicalAverage) / historicalAverage) * 100),
          recommendation: 'Review your recent purchases and identify any unusual expenses. Consider setting daily spending limits of $' + Math.round(historicalAverage) + ' to get back on track.'
        });
      } else if (recentAverage < historicalAverage * 0.75) {
        insights.push({
          id: `recent-decrease-${Date.now()}`,
          type: 'success',
          title: 'Excellent Spending Control',
          description: `You've reduced your spending by ${Math.round(((historicalAverage - recentAverage) / historicalAverage) * 100)}% recently`,
          percentage: Math.round(((historicalAverage - recentAverage) / historicalAverage) * 100),
          recommendation: 'Fantastic progress! Consider putting the money you\'re saving into an emergency fund or investment account.'
        });
      }
    }
  }

  // Budget optimization insight
  if (insights.length < 3) {
    const topCategory = Object.entries(categoryGroups)
      .map(([cat, trans]) => ({ 
        category: cat, 
        total: trans.reduce((sum, t) => sum + t.amount, 0),
        percentage: (trans.reduce((sum, t) => sum + t.amount, 0) / totalSpending) * 100
      }))
      .sort((a, b) => b.total - a.total)[0];

    if (topCategory && topCategory.percentage > 20) {
      const advice = categoryAdvice[topCategory.category];
      insights.push({
        id: `optimization-${Date.now()}`,
        type: 'info',
        title: 'Budget Optimization Opportunity',
        description: `${topCategory.category} is your largest expense category at ${topCategory.percentage.toFixed(1)}% of spending`,
        category: topCategory.category,
        percentage: Math.round(topCategory.percentage),
        recommendation: advice ? 
          `Focus on optimizing this category: ${advice.tips.join(', ')}. ${advice.budgetSuggestion}.` :
          `Since this is your largest expense, look for ways to reduce costs by 10-15% through better planning and alternatives.`
      });
    }
  }

  // Fallback encouragement
  if (insights.length === 0) {
    insights.push({
      id: `encouragement-${Date.now()}`,
      type: 'info',
      title: 'Building Strong Financial Habits',
      description: 'You\'re on the right track by consistently tracking your expenses',
      recommendation: 'Continue logging transactions for 2-3 more weeks to unlock personalized budget recommendations and spending optimization tips.'
    });
  }

  return insights.slice(0, 3);
};