import {
 createContext,
 useContext,
 useEffect,
 useRef,
 useState,
 type ReactNode,
 type MutableRefObject,
} from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import type { RaceSocketUpdate } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RaceSocketContextValue {
 updates: Map<string, RaceSocketUpdate>;
 clientRef: MutableRefObject<Client | null>;
 connected: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Strip /api suffix from the base URL to get the WebSocket root
const WS_URL =
 (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api$/, '') + '/ws';

// ─── Context ──────────────────────────────────────────────────────────────────

const RaceSocketContext = createContext<RaceSocketContextValue>({
 updates: new Map(),
 clientRef: { current: null },
 connected: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RaceSocketProvider({ children }: { children: ReactNode }) {
 const [updates, setUpdates] = useState<Map<string, RaceSocketUpdate>>(new Map());
 const [connected, setConnected] = useState(false);
 const clientRef = useRef<Client | null>(null);

 useEffect(() => {
 const client = new Client({
 webSocketFactory: () => new SockJS(WS_URL) as WebSocket,
 reconnectDelay: 5000,
 onConnect: () => {
 setConnected(true);
 client.subscribe('/topic/race-status', (msg) => {
 try {
 const { raceId, status, message, updatedAt } = JSON.parse(msg.body) as {
 raceId: unknown;
 status: unknown;
 message?: string;
 updatedAt?: string;
 };
 if (!raceId || !status) return;

 setUpdates((prev) => {
 const next = new Map(prev);
 next.set(String(raceId), {
 // Normalize casing — backend may send lowercase status values
 status: String(status).toUpperCase() as RaceSocketUpdate['status'],
 message,
 updatedAt,
 });
 return next;
 });
 } catch {
 // Ignore malformed frames silently
 }
 });
 },
 onDisconnect: () => setConnected(false),
 });

 client.activate();
 clientRef.current = client;

 return () => {
 client.deactivate();
 };
 }, []);

 return (
 <RaceSocketContext.Provider value={{ updates, clientRef, connected }}>
 {children}
 </RaceSocketContext.Provider>
 );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Returns the live Map of race status updates, keyed by raceId (string). */
export function useRaceUpdates(): Map<string, RaceSocketUpdate> {
 return useContext(RaceSocketContext).updates;
}

/** Returns the raw STOMP client ref and connection state — for hooks that need
 * to subscribe to additional topics (e.g. per-race bet updates). */
export function useRaceSocket(): Pick<RaceSocketContextValue, 'clientRef' | 'connected'> {
 const { clientRef, connected } = useContext(RaceSocketContext);
 return { clientRef, connected };
}
