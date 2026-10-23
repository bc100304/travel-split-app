import { ExpenseItem, TripInfo } from '../types';

const STORAGE_KEY_TRIP = 'travel_split_trip_v1';
const STORAGE_KEY_EXPENSES = 'travel_split_expenses_v1';

export const loadStoredTrip = (): TripInfo | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRIP);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load trip from localStorage', e);
    return null;
  }
};

export const saveStoredTrip = (trip: TripInfo): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TRIP, JSON.stringify(trip));
  } catch (e) {
    console.error('Failed to save trip to localStorage', e);
  }
};

export const loadStoredExpenses = (): ExpenseItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EXPENSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load expenses from localStorage', e);
    return [];
  }
};

export const saveStoredExpenses = (expenses: ExpenseItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses to localStorage', e);
  }
};

export const clearAllStorageData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_TRIP);
    localStorage.removeItem(STORAGE_KEY_EXPENSES);
  } catch (e) {
    console.error('Failed to clear localStorage', e);
  }
};
