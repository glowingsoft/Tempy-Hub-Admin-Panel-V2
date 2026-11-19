import { io } from 'socket.io-client';

import { CONFIG } from 'src/config-global';

export const AUTH_ME_UPDATED_EVENT = 'auth:me:updated';
export const AUTH_SOCKET_NAMESPACE = '/auth';

let sharedSocket = null;
let sharedConnectionKey = null;
let disconnectTimer = null;

function isDevelopmentMode() {
  return import.meta.env.VITE_MODE === 'development';
}

function logDev(...args) {
  if (isDevelopmentMode()) {
    console.log(...args);
  }
}

export function getSocketOrigin() {
  const explicit = CONFIG.site.socketUrl || import.meta.env.VITE_SOCKET_URL;
  if (explicit) {
    return String(explicit).replace(/\/+$/, '').replace(/\/auth$/i, '');
  }

  const base = import.meta.env.VITE_BASE_URL || CONFIG.site.serverUrl || import.meta.env.VITE_SERVER_URL || '';
  return String(base)
    .replace(/\/+$/, '')
    .replace(/\/api(?:\/v\d+)?$/i, '');
}

export function unwrapAuthMePayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data && typeof payload.data === 'object' && ('access' in payload.data || 'user' in payload.data)) {
    return payload.data;
  }
  return payload;
}

function createSocket(origin, { token, organizationId }) {
  const socket = io(`${origin}${AUTH_SOCKET_NAMESPACE}`, {
    autoConnect: true,
    reconnection: true,
    transports: ['polling', 'websocket'],
    query: {
      token,
      organizationId,
    },
    auth: {
      token,
      organizationId,
    },
  });

  socket.on('connect', () => {
    logDev('Socket live', AUTH_SOCKET_NAMESPACE);
  });

  socket.on('connect_error', (error) => {
    logDev('Socket connect error', error?.message || error);
  });

  return socket;
}

export function disconnectAuthSocket() {
  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }

  if (!sharedSocket) return;

  sharedSocket.disconnect();
  sharedSocket = null;
  sharedConnectionKey = null;
}

export function connectAuthSocket({ token, organizationId, onMeUpdated }) {
  const origin = getSocketOrigin();
  if (!origin || !token || !organizationId) {
    return () => {};
  }

  const connectionKey = `${token}:${organizationId}`;

  if (disconnectTimer) {
    clearTimeout(disconnectTimer);
    disconnectTimer = null;
  }

  if (sharedSocket && sharedConnectionKey !== connectionKey) {
    disconnectAuthSocket();
  }

  if (!sharedSocket) {
    sharedConnectionKey = connectionKey;
    sharedSocket = createSocket(origin, { token, organizationId });
  }

  const handleUpdated = (payload) => {
    onMeUpdated?.(unwrapAuthMePayload(payload));
  };

  sharedSocket.on(AUTH_ME_UPDATED_EVENT, handleUpdated);

  if (sharedSocket.connected) {
    logDev('Socket live', AUTH_SOCKET_NAMESPACE);
  }

  return () => {
    sharedSocket?.off(AUTH_ME_UPDATED_EVENT, handleUpdated);

    disconnectTimer = setTimeout(() => {
      disconnectAuthSocket();
    }, 300);
  };
}
