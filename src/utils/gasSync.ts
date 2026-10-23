import { ExpenseItem, TripInfo } from '../types';

export interface GasSyncResponse {
  status: 'success' | 'error';
  message?: string;
  trip?: TripInfo | null;
  expenses?: ExpenseItem[];
  timestamp?: number;
}

/**
 * Fetch trip data and expenses from Google Sheets via GAS Web App
 */
export const fetchTripFromGas = async (url: string): Promise<GasSyncResponse> => {
  if (!url || !url.trim().startsWith('http')) {
    throw new Error('請提供有效的 Google Apps Script 網址 (https://script.google.com/...)');
  }

  const cleanUrl = url.trim();
  const response = await fetch(cleanUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`連線失敗 HTTP ${response.status}：請確認 GAS Web App 權限是否設為「所有人 (Anyone)」`);
  }

  const json = (await response.json()) as GasSyncResponse;
  if (json.status !== 'success') {
    throw new Error(json.message || 'Google 試算表回傳錯誤');
  }

  return json;
};

/**
 * Sync all trip info and expenses to Google Sheets via GAS Web App
 */
export const syncTripToGas = async (
  url: string,
  trip: TripInfo,
  expenses: ExpenseItem[]
): Promise<GasSyncResponse> => {
  if (!url || !url.trim().startsWith('http')) {
    throw new Error('請提供有效的 Google Apps Script 網址');
  }

  const cleanUrl = url.trim();
  const payload = {
    action: 'syncAll',
    trip,
    expenses,
  };

  // Using text/plain avoids CORS preflight OPTIONS block in GAS Web Apps
  const response = await fetch(cleanUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
  });

  if (!response.ok) {
    throw new Error(`同步失敗 HTTP ${response.status}：請檢查 GAS Web App 設定`);
  }

  const json = (await response.json()) as GasSyncResponse;
  if (json.status !== 'success') {
    throw new Error(json.message || '無法儲存至 Google 試算表');
  }

  return json;
};

/**
 * Test connectivity with GAS Web App
 */
export const testGasConnection = async (url: string): Promise<boolean> => {
  try {
    const res = await fetchTripFromGas(url);
    return res.status === 'success';
  } catch (err) {
    console.warn('GAS Connection test failed:', err);
    throw err;
  }
};
