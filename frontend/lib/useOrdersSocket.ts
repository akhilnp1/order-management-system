"use client";

import { useEffect, useRef, useState } from "react";
import { Order } from "@/lib/api";

export interface OrderEvent {
  event: "order_created" | "order_status_updated";
  order: Order;
  previous_status?: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/orders";

/**
 * Subscribes to the backend WebSocket and invokes onEvent for every
 * order-related broadcast. Automatically reconnects with backoff if
 * the connection drops.
 */
export function useOrdersSocket(onEvent: (event: OrderEvent) => void) {
  const [connected, setConnected] = useState(false);
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function connect() {
      socket = new WebSocket(WS_URL);

      socket.onopen = () => setConnected(true);

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as OrderEvent;
          callbackRef.current(parsed);
        } catch {
          // ignore malformed messages
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, []);

  return { connected };
}
