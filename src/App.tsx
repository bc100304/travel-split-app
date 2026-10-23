import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Receipt,
  Scale,
  MapPin,
  Settings,
  Plus,
  Compass,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ExpenseItem, TripInfo } from './types';
import {
  loadStoredTrip,
  saveStoredTrip,
  loadStoredExpenses,
  saveStoredExpenses,
  clearAllStorageData,
} from './utils/storage';
import { DEMO_TRIP, DEMO_EXPENSES, DEFAULT_GAS_URL } from './utils/demoData';
import { syncTripToGas, fetchTripFromGas } from './utils/gasSync';

// Components
import { Header } from './components/Header';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ExpenseListView } from './components/ExpenseListView';
import { SettlementView } from './components/SettlementView';
import { FootprintMapView } from './components/FootprintMapView';
import { SettingsView } from './components/SettingsView';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { GasGuideModal } from './components/GasGuideModal';
import { GitHubPagesGuideModal } from './components/GitHubPagesGuideModal';
import { TripSetupWizardModal } from './components/TripSetupWizardModal';

type ActiveTab = 'expenses' | 'settlement' | 'map' | 'settings';

export default function App() {
  // App State - Default to user's Google Sheet URL
  const [trip, setTrip] = useState<TripInfo>(() => {
    const saved = loadStoredTrip();
    if (saved) {
      if (!saved.gasWebAppUrl) {
        saved.gasWebAppUrl = DEFAULT_GAS_URL;
      }
      return saved;
    }
    return { ...DEMO_TRIP, gasWebAppUrl: DEFAULT_GAS_URL };
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = loadStoredExpenses();
    return saved.length > 0 ? saved : DEMO_EXPENSES;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('expenses');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [isGasGuideOpen, setIsGasGuideOpen] = useState(false);
  const [isGitHubGuideOpen, setIsGitHubGuideOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const initialFetchDoneRef = useRef(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist to local storage on changes
  useEffect(() => {
    saveStoredTrip(trip);
  }, [trip]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  // Initial cloud fetch from Google Sheet on app startup
  useEffect(() => {
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;

    const targetUrl = trip.gasWebAppUrl || DEFAULT_GAS_URL;
    if (targetUrl) {
      fetchTripFromGas(targetUrl)
        .then((res) => {
          if (res.status === 'success') {
            if (res.trip) {
              setTrip((prev) => ({
                ...res.trip!,
                gasWebAppUrl: targetUrl,
                lastSyncedAt: Date.now(),
              }));
            }
            if (res.expenses && Array.isArray(res.expenses) && res.expenses.length > 0) {
              setExpenses(res.expenses);
            }
            showToast('已自 Google 試算表連線載入最新資料！');
          }
        })
        .catch((err) => {
          console.warn('Initial cloud sync check:', err);
        });
    }
  }, [trip.gasWebAppUrl]);

  // Sync with Google Sheets via GAS (Upload)
  const handleSyncGasUpload = useCallback(async () => {
    const targetUrl = trip.gasWebAppUrl || DEFAULT_GAS_URL;
    if (!targetUrl) {
      setIsGasGuideOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      await syncTripToGas(targetUrl, trip, expenses);
      setTrip((prev) => ({ ...prev, lastSyncedAt: Date.now() }));
      showToast('已成功上傳並同步至 Google 試算表！');
    } catch (err: any) {
      showToast(err.message || '同步至 Google 試算表失敗', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [trip, expenses]);

  // Sync with Google Sheets via GAS (Download)
  const handleSyncGasDownload = useCallback(async () => {
    const targetUrl = trip.gasWebAppUrl || DEFAULT_GAS_URL;
    if (!targetUrl) {
      setIsGasGuideOpen(true);
      return;
    }
    setIsSyncing(true);
    try {
      const res = await fetchTripFromGas(targetUrl);
      if (res.trip) {
        setTrip((prev) => ({ ...res.trip!, gasWebAppUrl: targetUrl }));
      }
      if (res.expenses && Array.isArray(res.expenses)) {
        setExpenses(res.expenses);
      }
      showToast('已從 Google 試算表下載最新資料！');
    } catch (err: any) {
      showToast(err.message || '下載同步失敗', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [trip.gasWebAppUrl]);

  // Handlers for Expenses (with background auto-sync to Google Sheet)
  const handleSaveExpense = (expenseData: Omit<ExpenseItem, 'id' | 'createdAt'> & { id?: string }) => {
    let updatedExpenses: ExpenseItem[];
    if (expenseData.id) {
      // Edit existing
      updatedExpenses = expenses.map((e) =>
        e.id === expenseData.id ? { ...e, ...expenseData } : e
      );
      setExpenses(updatedExpenses);
      showToast('支出紀錄已修改完成！');
    } else {
      // Add new
      const newItem: ExpenseItem = {
        ...expenseData,
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: Date.now(),
      };
      updatedExpenses = [newItem, ...expenses];
      setExpenses(updatedExpenses);
      showToast('已記錄一筆新花費！');
      confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
    }

    setEditingExpense(null);

    // Auto-sync to Google Sheets in background
    const targetUrl = trip.gasWebAppUrl || DEFAULT_GAS_URL;
    if (targetUrl) {
      syncTripToGas(targetUrl, trip, updatedExpenses)
        .then(() => setTrip((prev) => ({ ...prev, lastSyncedAt: Date.now() })))
        .catch((err) => console.warn('Background auto-sync error:', err));
    }
  };

  const handleEditExpense = (expense: ExpenseItem) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (confirm('確定要刪除這筆開銷紀錄嗎？')) {
      const updated = expenses.filter((e) => e.id !== expenseId);
      setExpenses(updated);
      showToast('已刪除開銷紀錄');

      // Auto-sync deletion to Google Sheets in background
      const targetUrl = trip.gasWebAppUrl || DEFAULT_GAS_URL;
      if (targetUrl) {
        syncTripToGas(targetUrl, trip, updated)
          .then(() => setTrip((prev) => ({ ...prev, lastSyncedAt: Date.now() })))
          .catch((err) => console.warn('Background delete-sync error:', err));
      }
    }
  };

  // Demo & Reset Handlers
  const handleLoadDemoData = () => {
    setTrip({ ...DEMO_TRIP, gasWebAppUrl: DEFAULT_GAS_URL });
    setExpenses(DEMO_EXPENSES);
    setIsSetupWizardOpen(false);
    showToast('已載入示範行程與開銷！');
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const handleClearAllData = () => {
    clearAllStorageData();
    setExpenses([]);
    setTrip({
      id: `trip-${Date.now()}`,
      name: '我的新旅行',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      currency: 'TWD',
      currencySymbol: 'NT$',
      members: [{ id: 'mem-1', name: '我', color: '#0d9488' }],
      gasWebAppUrl: DEFAULT_GAS_URL,
    });
    showToast('所有資料已重設');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-teal-500 selection:text-white pb-20 sm:pb-8">
      {/* Offline banner */}
      <OfflineIndicator />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/95 text-white text-xs font-semibold shadow-xl backdrop-blur-xs animate-in slide-in-from-top-4 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-1 p-0.5 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        trip={trip}
        onOpenSettings={() => setActiveTab('settings')}
        onOpenGasGuide={() => setIsGasGuideOpen(true)}
        onOpenGitHubGuide={() => setIsGitHubGuideOpen(true)}
        onSyncGas={handleSyncGasUpload}
        isSyncing={isSyncing}
      />

      {/* Desktop / Tablet Sub-navigation Tabs */}
      <div className="hidden sm:block border-b border-slate-200/90 bg-white">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-1">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'expenses'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>記帳明細 ({expenses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settlement')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'settlement'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>統計與分攤結算</span>
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'map'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>地圖與足跡</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'settings'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>旅程設定與同步</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-4 sm:py-6">
        {activeTab === 'expenses' && (
          <ExpenseListView
            trip={trip}
            expenses={expenses}
            onAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {activeTab === 'settlement' && (
          <SettlementView trip={trip} expenses={expenses} />
        )}

        {activeTab === 'map' && (
          <FootprintMapView
            trip={trip}
            expenses={expenses}
            onAddExpenseWithGps={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            trip={trip}
            expenses={expenses}
            onUpdateTrip={(updated) => {
              setTrip(updated);
              showToast('旅程設定已更新');
            }}
            onSyncGasUpload={handleSyncGasUpload}
            onSyncGasDownload={handleSyncGasDownload}
            onLoadDemoData={handleLoadDemoData}
            onClearData={handleClearAllData}
            onOpenGasGuide={() => setIsGasGuideOpen(true)}
            onOpenGitHubGuide={() => setIsGitHubGuideOpen(true)}
            onImportData={({ trip: t, expenses: e }) => {
              setTrip(t);
              setExpenses(e);
            }}
          />
        )}
      </main>

      {/* Mobile Floating Action Button (Quick Add) */}
      <button
        onClick={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        className="sm:hidden fixed right-4 bottom-20 z-40 w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-95 text-white shadow-xl flex items-center justify-center transition border-2 border-white"
        title="快速記一筆"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'expenses' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Receipt className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">記帳</span>
        </button>

        <button
          onClick={() => setActiveTab('settlement')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'settlement' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">分攤結算</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'map' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">足跡地圖</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition ${
            activeTab === 'settings' ? 'text-teal-700 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Settings className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">設定</span>
        </button>
      </nav>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSubmit={handleSaveExpense}
        trip={trip}
        editingExpense={editingExpense}
      />

      <GasGuideModal
        isOpen={isGasGuideOpen}
        onClose={() => setIsGasGuideOpen(false)}
      />

      <GitHubPagesGuideModal
        isOpen={isGitHubGuideOpen}
        onClose={() => setIsGitHubGuideOpen(false)}
      />

      <TripSetupWizardModal
        isOpen={isSetupWizardOpen}
        onComplete={(newTrip) => {
          setTrip({ ...newTrip, gasWebAppUrl: DEFAULT_GAS_URL });
          setExpenses([]);
          setIsSetupWizardOpen(false);
          showToast('旅程已建立！');
        }}
        onLoadDemo={handleLoadDemoData}
      />
    </div>
  );
}
