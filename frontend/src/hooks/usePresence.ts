import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import type { PresenceUser } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const WS_BASE = API_URL.replace(/^https/, 'wss').replace(/^http/, 'ws');

export function usePresence(docId: string): PresenceUser[] {
  // Reactive — re-connects automatically if token changes (login/logout)
  const token = useAuthStore((s) => s.token);
  const [users, setUsers] = useState<PresenceUser[]>([]);
  // Keep a stable ref to the active socket so cleanup is always correct
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token || !docId) return;

    let closed = false;

    function connect(): void {
      if (closed) return;

      const ws = new WebSocket(
        `${WS_BASE}/api/documents/${docId}/presence?token=${encodeURIComponent(token!)}`
      );
      wsRef.current = ws;
      let heartbeat: ReturnType<typeof setInterval>;

      ws.onopen = () => {
        // Ping every 10s — server replies with full room state, keeping the list
        // consistent even if a join/leave broadcast was dropped mid-flight
        heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) ws.send('ping');
        }, 10_000);
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            users?: PresenceUser[];
            user_id?: string;
            display_name?: string;
            color?: string;
          };
          if (msg.type === 'presence_list') {
            setUsers(msg.users ?? []);
          } else if (msg.type === 'joined' && msg.user_id) {
            setUsers((prev) => [
              ...prev.filter((u) => u.user_id !== msg.user_id),
              { user_id: msg.user_id!, display_name: msg.display_name!, color: msg.color! },
            ]);
          } else if (msg.type === 'left' && msg.user_id) {
            setUsers((prev) => prev.filter((u) => u.user_id !== msg.user_id));
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onclose = (event) => {
        clearInterval(heartbeat);
        setUsers([]);
        // Reconnect after 3 s unless this was a clean close or auth failure
        if (!closed && event.code !== 1000 && event.code !== 4001) {
          setTimeout(() => connect(), 3_000);
        }
      };

      ws.onerror = () => {
        // onclose fires right after, which handles reconnect
      };
    }

    connect();

    return () => {
      closed = true;
      const ws = wsRef.current;
      wsRef.current = null;
      setUsers([]);
      if (ws) {
        // Silence the old socket — closing a still-connecting one throws in dev (Strict Mode).
        ws.onopen = null;
        ws.onmessage = null;
        ws.onclose = null;
        ws.onerror = null;
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000);
        }
      }
    };
  }, [docId, token]);

  return users;
}
