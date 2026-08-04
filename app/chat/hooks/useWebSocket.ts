/* eslint-disable react-hooks/immutability */

import { useCallback, useEffect, useRef } from 'react';
import ReconnectingWebSocket from '@opensumi/reconnecting-websocket';
import { useSignal } from '@preact/signals-react';

export enum Status {
  connected = 'connected',
  disconnected = 'disconnected',
  reconnecting = 'reconnecting',
}

export type Message = {
  id: string;
  text: string;
  from: 'me' | 'consultant';
  pending?: boolean;
};

export const useWebSocket = () => {
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const pendingQueue = useRef<Message[]>([]);

  const status = useSignal<Status>(Status.disconnected);
  const messages = useSignal<Message[]>([]);

  const flushQueue = useCallback(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    const queue = pendingQueue.current;
    if (queue.length === 0) return;

    queue.forEach((msg) => ws.send(msg.text));
    pendingQueue.current = [];

    messages.value = messages.value.map((m) =>
      queue.some((q) => q.id === m.id) ? { ...m, pending: false } : m,
    );
  }, []);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      status.value = Status.connected;
      flushQueue();
    };

    ws.onclose = () => {
      status.value = Status.reconnecting;
    };

    ws.onmessage = (event) => {
      messages.value = [
        ...messages.value,
        {
          id: crypto.randomUUID(),
          text: event.data,
          from: 'consultant',
        },
      ];
    };

    return () => ws.close();
  }, [flushQueue]);

  const sendMessage = useCallback((text: string) => {
    const isOpen = wsRef.current?.readyState === WebSocket.OPEN;

    const msg: Message = {
      id: crypto.randomUUID(),
      text,
      from: 'me',
      pending: !isOpen,
    };

    messages.value = [...messages.value, msg];

    if (isOpen) {
      wsRef.current!.send(text);
    } else {
      pendingQueue.current.push(msg);
    }
  }, []);

  const retryPending = useCallback(() => flushQueue(), [flushQueue]);

  return { messages, status, sendMessage, retryPending };
};
