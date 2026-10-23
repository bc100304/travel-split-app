import { ExpenseItem, Member, TripInfo } from '../types';

export const DEMO_MEMBERS: Member[] = [
  { id: 'mem-1', name: '小明 (我)', color: '#0d9488' },
  { id: 'mem-2', name: '小美', color: '#ec4899' },
  { id: 'mem-3', name: '阿豪', color: '#3b82f6' },
  { id: 'mem-4', name: '佩佩', color: '#f59e0b' },
];

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbzTTcQe5KY2woavuh8RIQ6djxXVub7IefJ3rqn2dA4AV2d8WtshQRUK1TxPHtHJ-nEP/exec';

export const DEMO_TRIP: TripInfo = {
  id: 'trip-demo-tokyo-2026',
  name: '東京秋天漫遊賞楓趣 🇯🇵',
  startDate: '2026-10-20',
  endDate: '2026-10-25',
  currency: 'TWD',
  currencySymbol: 'NT$',
  members: DEMO_MEMBERS,
  gasWebAppUrl: DEFAULT_GAS_URL,
};

export const DEMO_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: '京王廣場飯店 3晚雙人房 (2間)',
    amount: 24800,
    category: 'stay',
    payerId: 'mem-4', // 佩佩
    splitMemberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    date: '2026-10-20',
    time: '15:30',
    locationName: '京王廣場飯店 新宿',
    latitude: 35.6896,
    longitude: 139.6922,
    note: '已含溫泉設施及兩日早餐自助吧',
    createdAt: 1771486200000,
  },
  {
    id: 'exp-2',
    title: '一蘭拉麵 新宿中央東口店',
    amount: 3200,
    category: 'food',
    payerId: 'mem-1', // 小明
    splitMemberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    date: '2026-10-20',
    time: '19:45',
    locationName: '一蘭 新宿中央東口店',
    latitude: 35.6905,
    longitude: 139.7028,
    note: '加點半熟蛋與特製叉燒，大家吃得超飽！',
    createdAt: 1771501500000,
  },
  {
    id: 'exp-3',
    title: '晴空塔展望台門票 4張',
    amount: 4200,
    category: 'entertainment',
    payerId: 'mem-3', // 阿豪
    splitMemberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    date: '2026-10-21',
    time: '10:15',
    locationName: '東京晴空塔 (Tokyo Skytree)',
    latitude: 35.7101,
    longitude: 139.8107,
    note: '快速通關包含天望迴廊門票',
    createdAt: 1771553700000,
  },
  {
    id: 'exp-4',
    title: '淺草雷門散策 & 抹茶糰子',
    amount: 1450,
    category: 'cafe',
    payerId: 'mem-2', // 小美
    splitMemberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    date: '2026-10-21',
    time: '14:20',
    locationName: '淺草寺 雷門',
    latitude: 35.7111,
    longitude: 139.7963,
    note: '現烤抹茶糰子 + 冰焙茶拿鐵',
    createdAt: 1771568400000,
  },
  {
    id: 'exp-5',
    title: '富士山一日遊包車接送 (7人座)',
    amount: 12000,
    category: 'transport',
    payerId: 'mem-1', // 小明
    splitMemberIds: ['mem-1', 'mem-2', 'mem-3', 'mem-4'],
    date: '2026-10-22',
    time: '08:00',
    locationName: '河口湖 大石公園',
    latitude: 35.5229,
    longitude: 138.7454,
    note: '含過路費與司機小費，拍到富士山倒影！',
    createdAt: 1771632000000,
  },
  {
    id: 'exp-6',
    title: '唐吉訶德 藥妝保養品退稅採購',
    amount: 5800,
    category: 'shopping',
    payerId: 'mem-2', // 小美
    splitMemberIds: ['mem-2', 'mem-4'], // 小美 & 佩佩 兩人平分
    date: '2026-10-22',
    time: '21:30',
    locationName: 'MEGA 唐吉訶德 澀谷本店',
    latitude: 35.6605,
    longitude: 139.6975,
    note: '女生組防曬乳與面膜補貨',
    createdAt: 1771680600000,
  },
];
