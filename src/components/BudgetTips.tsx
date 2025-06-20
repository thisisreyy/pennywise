import React from 'react';
import { MLInsights, CurrencySettings } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Target, Brain } from 'lucide-react';
import { formatCurrency } from '../utils/currencyService';

interface BudgetTipsProps {
  insights: MLInsights;
  baseCurrency: string;
  currencySettings: CurrencySettings;
}

const BudgetTips: React.FC<BudgetTipsProps> = ({ insights, baseCurrency }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'success':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'info':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-purple-500/10 p-3 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Budget Advisor</h2>
            <p className="text-gray-400">Personalized insights based on your spending patterns</p>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-2">
            {insights.monthlyTrend >= 0 ? (
              <TrendingUp className="w-5 h-5 text-red-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-400" />
            )}
            <span className="text-white font-medium">Monthly Trend</span>
          </div>
          <span className={`font-semibold ${insights.monthlyTrend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
            {insights.monthlyTrend >= 0 ? '+' : ''}{insights.monthlyTrend.toFixed(1)}%
          </span>
          <span className="text-gray-400 text-sm">
            {insights.monthlyTrend >= 0 ? 'vs last month' : 'savings vs last month'}
          </span>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Spending Categories</h3>
        <div className="space-y-3">
          {insights.topCategories.map((category, index) => (
            <div key={category.category} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-blue-400 font-semibold text-sm">{index + 1}</span>
                </div>
                <span className="text-white font-medium">{category.category}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-semibold">{formatCurrency(category.amount, baseCurrency)}</div>
                <div className="text-sm text-gray-400">{category.percentage.toFixed(1)}% of total</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ML Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Smart Insights</h3>
        
        {insights.insights.length > 0 ? (
          <div className="space-y-4">
            {insights.insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-6 rounded-xl border ${getInsightColor(insight.type)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`${getInsightColor(insight.type)} p-2 rounded-lg`}>
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-2">{insight.title}</h4>
                    <p className="text-gray-300 mb-3">{insight.description}</p>
                    
                    {insight.percentage && (
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="bg-gray-700 rounded-full h-2 flex-1">
                          <div
                            className={`h-2 rounded-full ${
                              insight.type === 'warning' ? 'bg-yellow-400' : 
                              insight.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                            }`}
                            style={{ width: `${Math.min(insight.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400">{insight.percentage}%</span>
                      </div>
                    )}
                    
                    {insight.recommendation && (
                      <div className="p-3 bg-gray-900/50 rounded-lg">
                        <p className="text-sm text-gray-300">
                          <strong className="text-white">Recommendation:</strong> {insight.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 text-center">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Building Your Profile</h3>
            <p className="text-gray-400">
              Add more transactions to unlock personalized insights and spending recommendations.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Our AI needs at least 10 transactions to generate meaningful insights.
            </p>
          </div>
        )}
      </div>

      {/* Clustering Information */}
      {insights.clusters.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Spending Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.clusters.map((cluster, index) => (
              <div key={index} className="p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{cluster.category}</h4>
                  <span className="text-sm text-gray-400">
                    {cluster.transactions.length} transactions
                  </span>
                </div>
                <div className="text-sm text-gray-300">
                  <p>Average: {formatCurrency(cluster.average, baseCurrency)}</p>
                  <p>Consistency: {cluster.variance < cluster.average * 0.2 ? 'High' : 'Variable'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTips;