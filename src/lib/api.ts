import { AuthResponse, Budget, Category, CategoryBreakdown, MonthlyTrend, Overview, PaginatedResponse, Transaction, User } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "expense-tracker-token";
const USER_KEY = "expense-tracker-user";

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = window.localStorage.getItem(USER_KEY);
  return user ? (JSON.parse(user) as User) : null;
}

export function persistAuth(auth: AuthResponse) {
  window.localStorage.setItem(TOKEN_KEY, auth.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function clearAuthStorage() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

async function parseResponse<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";
  const payload: unknown = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
          ? payload.error
          : payload &&
              typeof payload === "object" &&
              "error" in payload &&
              payload.error &&
              typeof payload.error === "object" &&
              "message" in payload.error
            ? String(payload.error.message)
            : "Request failed";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  options?: { authenticated?: boolean },
) {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(options?.authenticated !== false && token
        ? { Authorization: `Bearer ${token}` }
        : {}),
      ...init?.headers,
    },
  });

  return parseResponse<T>(response);
}

export async function apiDownload(path: string) {
  const token = getStoredToken();
  const response = await fetch(`${API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError("Unable to export file", response.status);
  }

  return response.text();
}

export const endpoints = {
  auth: {
    login: (payload: { email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }, { authenticated: false }),
    register: (payload: { name: string; email: string; password: string }) =>
      apiFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }, { authenticated: false }),
    profile: () => apiFetch<User>("/auth/profile"),
  },
  users: {
    update: (payload: { name?: string; currency?: string }) =>
      apiFetch<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
  },
  categories: (type?: string) =>
    apiFetch<Category[]>(type ? `/categories?type=${type}` : "/categories"),
  overview: (month: string) =>
    apiFetch<Overview>(`/analytics/overview?month=${month}`),
  categoryBreakdown: (month: string) =>
    apiFetch<CategoryBreakdown[]>(`/analytics/category-breakdown?month=${month}`),
  monthlyTrends: (months: number) =>
    apiFetch<MonthlyTrend[]>(`/analytics/monthly-trends?months=${months}`),
  transactions: (queryString: string) =>
    apiFetch<PaginatedResponse<Transaction>>(`/transactions${queryString}`),
  createTransaction: (payload: Record<string, unknown>) =>
    apiFetch<Transaction>("/transactions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateTransaction: (id: string, payload: Record<string, unknown>) =>
    apiFetch<Transaction>(`/transactions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteTransaction: (id: string) =>
    apiFetch<{ success: boolean }>(`/transactions/${id}`, {
      method: "DELETE",
    }),
  budgets: (month: string) => apiFetch<Budget[]>(`/budgets?month=${month}`),
  createBudget: (payload: Record<string, unknown>) =>
    apiFetch<Budget>("/budgets", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateBudget: (id: string, payload: Record<string, unknown>) =>
    apiFetch<Budget>(`/budgets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  deleteBudget: (id: string) =>
    apiFetch<{ success: boolean }>(`/budgets/${id}`, {
      method: "DELETE",
    }),
};
