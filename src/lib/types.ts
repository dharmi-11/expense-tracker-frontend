export type TransactionType = "INCOME" | "EXPENSE";

export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  notes?: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
}

export interface Budget {
  id: string;
  month: string;
  amount: number;
  spent: number;
  remaining: number;
  progress: number;
  category: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
}

export interface Overview {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  totalBudget: number;
  budgetProgress: number;
  recentTransactions: Array<{
    id: string;
    title: string;
    amount: number;
    type: TransactionType;
    transactionDate: string;
    category: {
      name: string;
      color: string;
    };
  }>;
}

export interface CategoryBreakdown {
  categoryId: string;
  category: string;
  color: string;
  amount: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
