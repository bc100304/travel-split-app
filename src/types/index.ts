export interface Member {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  payerId: string;
  splitMemberIds: string[];
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  locationName?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  createdAt: number;
}

export interface TripInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  currency: string;
  currencySymbol: string;
  members: Member[];
  gasWebAppUrl: string;
  lastSyncedAt?: number;
}

export interface MemberBalance {
  memberId: string;
  member: Member;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // >0 is owed money, <0 owes money
}

export interface SettlementDebt {
  id: string;
  fromMemberId: string;
  fromMember: Member;
  toMemberId: string;
  toMember: Member;
  amount: number;
}

export interface CategoryInfo {
  id: string;
  name: string;
  iconName: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}
