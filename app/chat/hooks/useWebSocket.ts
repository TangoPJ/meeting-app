import { useCallback, useEffect, useRef, useState } from 'react';
import ReconnectingWebSocket from '@opensumi/reconnecting-websocket';

type Status = 'connected' | 'disconnected' | 'reconnecting';

export type Message = {
  id: string;
  text: string;
  from: 'me' | 'consultant';
  pending?: boolean;
};

export const useWebSocket = () => {
  const wsRef = useRef<ReconnectingWebSocket | null>(null);
  const pendingQueue = useRef<Message[]>([]);

  const [status, setStatus] = useState<Status>('disconnected');
  const [messages, setMessages] = useState<Message[]>([]);

  const flushQueue = useCallback(() => {
    if (!wsRef.current) return;

    pendingQueue.current.forEach((msg) => {
      wsRef.current!.send(msg.text);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, pending: false } : m)),
      );
    });

    pendingQueue.current = [];
  }, []);

  useEffect(() => {
    const ws = new ReconnectingWebSocket(process.env.NEXT_PUBLIC_WS_URL!);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      flushQueue();
    };

    ws.onclose = () => setStatus('reconnecting');

    ws.onmessage = (event) => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: event.data, from: 'consultant' },
      ]);
    };

    return () => ws.close();
  }, [flushQueue]);

  const sendMessage = useCallback((text: string) => {
    const msg: Message = {
      id: crypto.randomUUID(),
      text,
      from: 'me',
      pending: false,
    };

    setMessages((prev) => [...prev, msg]);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(text);
    } else {
      msg.pending = true;
      pendingQueue.current.push(msg);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, pending: true } : m)),
      );
    }
  }, []);

  const retryPending = useCallback(() => flushQueue(), [flushQueue]);

  return { messages, status, sendMessage, retryPending };
};
