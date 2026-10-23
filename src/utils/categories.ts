import { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    name: '餐飲美食',
    iconName: 'Utensils',
    bgColor: 'bg-orange-50 text-orange-600',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
  },
  {
    id: 'stay',
    name: '住宿飯店',
    iconName: 'Hotel',
    bgColor: 'bg-indigo-50 text-indigo-600',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
  },
  {
    id: 'transport',
    name: '交通接駁',
    iconName: 'Car',
    bgColor: 'bg-blue-50 text-blue-600',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
  {
    id: 'entertainment',
    name: '景點娛樂',
    iconName: 'Ticket',
    bgColor: 'bg-emerald-50 text-emerald-600',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
  },
  {
    id: 'shopping',
    name: '購物採買',
    iconName: 'ShoppingBag',
    bgColor: 'bg-pink-50 text-pink-600',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
  },
  {
    id: 'cafe',
    name: '咖啡甜點',
    iconName: 'Coffee',
    bgColor: 'bg-amber-50 text-amber-600',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
  },
  {
    id: 'other',
    name: '其他雜項',
    iconName: 'Receipt',
    bgColor: 'bg-slate-50 text-slate-600',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
  },
];

export const getCategoryById = (id: string): CategoryInfo => {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

export const MEMBER_COLORS = [
  '#0d9488', // Teal
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#6366f1', // Indigo
];
