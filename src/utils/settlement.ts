import { ExpenseItem, Member, MemberBalance, SettlementDebt, TripInfo } from '../types';

export const calculateMemberBalances = (
  members: Member[],
  expenses: ExpenseItem[]
): MemberBalance[] => {
  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const paidMap = new Map<string, number>();
  const shareMap = new Map<string, number>();

  members.forEach((m) => {
    paidMap.set(m.id, 0);
    shareMap.set(m.id, 0);
  });

  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    if (amount <= 0) return;

    // Credit payer
    const currentPaid = paidMap.get(expense.payerId) || 0;
    paidMap.set(expense.payerId, currentPaid + amount);

    // Debit split members
    const splits = expense.splitMemberIds && expense.splitMemberIds.length > 0
      ? expense.splitMemberIds
      : members.map((m) => m.id);

    const sharePerPerson = amount / splits.length;
    splits.forEach((memberId) => {
      const currentShare = shareMap.get(memberId) || 0;
      shareMap.set(memberId, currentShare + sharePerPerson);
    });
  });

  return members.map((m) => {
    const totalPaid = Math.round((paidMap.get(m.id) || 0) * 100) / 100;
    const totalShare = Math.round((shareMap.get(m.id) || 0) * 100) / 100;
    const netBalance = Math.round((totalPaid - totalShare) * 100) / 100;

    return {
      memberId: m.id,
      member: m,
      totalPaid,
      totalShare,
      netBalance,
    };
  });
};

/**
 * Simplified Debt Settlement Algorithm (Greedy matching)
 * Minimizes total number of transactions between companions.
 */
export const calculateSimplifiedDebts = (
  balances: MemberBalance[]
): SettlementDebt[] => {
  // Deep clone balance copies
  interface PersonDebt {
    member: Member;
    balance: number; // positive = creditor (receives), negative = debtor (pays)
  }

  const debtors: PersonDebt[] = [];
  const creditors: PersonDebt[] = [];

  balances.forEach((b) => {
    const rounded = Math.round(b.netBalance * 100) / 100;
    if (rounded < -0.01) {
      debtors.push({ member: b.member, balance: rounded });
    } else if (rounded > 0.01) {
      creditors.push({ member: b.member, balance: rounded });
    }
  });

  // Sort debtors ascending (owes most first: -100 before -20)
  debtors.sort((a, b) => a.balance - b.balance);
  // Sort creditors descending (owed most first: 100 before 20)
  creditors.sort((a, b) => b.balance - a.balance);

  const debts: SettlementDebt[] = [];
  let dIdx = 0;
  let cIdx = 0;
  let count = 0;

  while (dIdx < debtors.length && cIdx < creditors.length && count < 200) {
    count++;
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amountOwed = Math.abs(debtor.balance);
    const amountReceivable = creditor.balance;

    const settledAmount = Math.min(amountOwed, amountReceivable);
    const roundedSettled = Math.round(settledAmount);

    if (roundedSettled > 0) {
      debts.push({
        id: `debt-${debtor.member.id}-${creditor.member.id}-${count}`,
        fromMemberId: debtor.member.id,
        fromMember: debtor.member,
        toMemberId: creditor.member.id,
        toMember: creditor.member,
        amount: roundedSettled,
      });
    }

    debtor.balance += settledAmount;
    creditor.balance -= settledAmount;

    if (Math.abs(debtor.balance) < 0.01) {
      dIdx++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      cIdx++;
    }
  }

  return debts;
};

export const formatCurrency = (amount: number, symbol: string = '$'): string => {
  const rounded = Math.round(amount);
  return `${symbol} ${rounded.toLocaleString()}`;
};

/**
 * Format summary for sharing in LINE or messenger chats
 */
export const generateLineShareText = (
  trip: TripInfo,
  balances: MemberBalance[],
  debts: SettlementDebt[],
  expenses: ExpenseItem[]
): string => {
  const totalCost = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const currency = trip.currencySymbol || '$';

  let text = `✈️【${trip.name}】旅費結算清單\n`;
  if (trip.startDate) {
    text += `📅 日期：${trip.startDate}${trip.endDate ? ` ~ ${trip.endDate}` : ''}\n`;
  }
  text += `💰 總開銷：${formatCurrency(totalCost, currency)} (共 ${expenses.length} 筆紀錄)\n`;
  text += `👥 成員：${trip.members.map((m) => m.name).join('、')}\n\n`;

  text += `📊【個人收支概況】\n`;
  balances.forEach((b) => {
    const netFormatted = formatCurrency(Math.abs(b.netBalance), currency);
    if (b.netBalance > 0.01) {
      text += `🟢 ${b.member.name}：已付 ${formatCurrency(b.totalPaid, currency)} (應收回 ${netFormatted})\n`;
    } else if (b.netBalance < -0.01) {
      text += `🔴 ${b.member.name}：已付 ${formatCurrency(b.totalPaid, currency)} (需補繳 ${netFormatted})\n`;
    } else {
      text += `⚪ ${b.member.name}：已付 ${formatCurrency(b.totalPaid, currency)} (已結清)\n`;
    }
  });

  text += `\n🤝【最終結算轉帳指引】\n`;
  if (debts.length === 0) {
    text += `✨ 太棒了！大家的帳目完全平準，無需轉帳結算！\n`;
  } else {
    debts.forEach((d, idx) => {
      text += `${idx + 1}. 👉 ${d.fromMember.name} 應轉帳 ${formatCurrency(d.amount, currency)} 給 ${d.toMember.name}\n`;
    });
  }

  text += `\n💡 來自「旅費分帳通 PWA」自動算帳，輕鬆出遊沒負擔！`;
  return text;
};
