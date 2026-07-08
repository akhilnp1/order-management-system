import axios, { AxiosInstance } from "axios";
import { getToken, clearToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Types ----------
export type OrderStatus = "Pending" | "Processing" | "Completed" | "Cancelled";

export interface Order {
  id: number;
  customer_name: string;
  amount: number;
  status: OrderStatus;
  amount_usd: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  total: number;
  page: number;
  page_size: number;
  items: Order[];
}

export interface OrderSummary {
  total_orders: number;
  status_summary: Record<OrderStatus, number>;
}

// ---------- API calls ----------
export async function login(username: string, password: string) {
  const { data } = await api.post("/api/auth/login", { username, password });
  return data as { access_token: string; token_type: string; expires_in: number };
}

export async function fetchOrders(params: {
  page?: number;
  page_size?: number;
  status?: OrderStatus;
  search?: string;
}) {
  const { data } = await api.get("/api/orders", { params });
  return data as OrderListResponse;
}

export async function fetchOrderSummary() {
  const { data } = await api.get("/api/orders/summary");
  return data as OrderSummary;
}

export async function fetchOrder(id: number) {
  const { data } = await api.get(`/api/orders/${id}`);
  return data as Order;
}

export async function createOrder(payload: {
  customer_name: string;
  amount: number;
  status?: OrderStatus;
}) {
  const { data } = await api.post("/api/orders", payload);
  return data;
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const { data } = await api.patch(`/api/orders/${id}/status`, { status });
  return data;
}
