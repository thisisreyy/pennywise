import { Category } from '../types';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Film, 
  Zap, 
  Heart, 
  GraduationCap, 
  Plane, 
  TrendingUp, 
  MoreHorizontal,
  Home,
  Gamepad2,
  Coffee,
  Shirt,
  Dumbbell,
  Gift,
  Baby,
  Wrench,
  Briefcase,
  PiggyBank
} from 'lucide-react';

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Food & Dining', color: '#ef4444', icon: 'utensils' },
  { name: 'Transportation', color: '#3b82f6', icon: 'car' },
  { name: 'Shopping', color: '#8b5cf6', icon: 'shopping-bag' },
  { name: 'Entertainment', color: '#f59e0b', icon: 'film' },
  { name: 'Bills & Utilities', color: '#10b981', icon: 'zap' },
  { name: 'Healthcare', color: '#ef4444', icon: 'heart' },
  { name: 'Education', color: '#6366f1', icon: 'graduation-cap' },
  { name: 'Travel', color: '#14b8a6', icon: 'plane' },
  { name: 'Investment', color: '#84cc16', icon: 'trending-up' },
  { name: 'Housing', color: '#f97316', icon: 'home' },
  { name: 'Gaming', color: '#ec4899', icon: 'gamepad-2' },
  { name: 'Coffee & Drinks', color: '#92400e', icon: 'coffee' },
  { name: 'Clothing', color: '#7c3aed', icon: 'shirt' },
  { name: 'Fitness', color: '#059669', icon: 'dumbbell' },
  { name: 'Gifts', color: '#dc2626', icon: 'gift' },
  { name: 'Childcare', color: '#f59e0b', icon: 'baby' },
  { name: 'Maintenance', color: '#6b7280', icon: 'wrench' },
  { name: 'Business', color: '#1f2937', icon: 'briefcase' },
  { name: 'Savings', color: '#065f46', icon: 'piggy-bank' },
  { name: 'Other', color: '#6b7280', icon: 'more-horizontal' }
];

export const getCategoryIcon = (categoryName: string) => {
  const iconMap: { [key: string]: any } = {
    'utensils': Utensils,
    'car': Car,
    'shopping-bag': ShoppingBag,
    'film': Film,
    'zap': Zap,
    'heart': Heart,
    'graduation-cap': GraduationCap,
    'plane': Plane,
    'trending-up': TrendingUp,
    'home': Home,
    'gamepad-2': Gamepad2,
    'coffee': Coffee,
    'shirt': Shirt,
    'dumbbell': Dumbbell,
    'gift': Gift,
    'baby': Baby,
    'wrench': Wrench,
    'briefcase': Briefcase,
    'piggy-bank': PiggyBank,
    'more-horizontal': MoreHorizontal
  };

  const category = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
  const iconKey = category?.icon || 'more-horizontal';
  return iconMap[iconKey] || MoreHorizontal;
};

export const getCategoryColor = (categoryName: string): string => {
  const category = DEFAULT_CATEGORIES.find(cat => cat.name === categoryName);
  return category?.color || '#6b7280';
};