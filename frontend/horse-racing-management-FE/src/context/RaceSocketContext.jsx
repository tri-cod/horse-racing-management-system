import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const RaceSocketContext = createContext({
  updates: new Map(),
  clientRef: { current: null },
  connected: false,
});

// Derive WS base from VITE_API_BASE_URL (strip /api suffix)
const WS_URL =
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api$/, '') + '/ws';

export function RaceSocketProvider({ children }) {
  // Map<raceId (string), { status, message, updatedAt }>
  const [updates, setUpdates] = useState(new Map());
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/race-status', (msg) => {
          try {
            const { raceId, status, message, updatedAt } = JSON.parse(msg.body);
            if (!raceId || !status) return;
            setUpdates((prev) => {
              const next = new Map(prev);
              next.set(String(raceId), {
                status: String(status).toUpperCase(), // normalize casing from BE
                message,
                updatedAt,
              });
              return next;
            });
          } catch {
            // ignore malformed frames
          }
        });
      },
      onDisconnect: () => setConnected(false), // [WS] báo cho hook biết để cleanup sub
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, []);

  return (
    <RaceSocketContext.Provider value={{ updates, clientRef, connected }}>
      {children}
    </RaceSocketContext.Provider>
  );
}

export function useRaceUpdates() {
  return useContext(RaceSocketContext).updates;
}

// [WS] Hook cho các hook khác cần subscribe topic riêng (vd: bet updates theo race)
export function useRaceSocket() {
  const { clientRef, connected } = useContext(RaceSocketContext);
  return { clientRef, connected };
}
