// Session Management Utility

import { SESSION_TIMEOUT_MS } from '../config/app.config';

interface SessionData {
  sessionId: string;
  createdAt: number;
  lastActivity: number;
}

let currentSession: SessionData | null = null;

/**
 * Generates a UUID v4 session ID
 */
export const generateSessionId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Creates a new session
 */
export const createSession = (): string => {
  const sessionId = generateSessionId();
  const now = Date.now();

  currentSession = {
    sessionId,
    createdAt: now,
    lastActivity: now,
  };

  return sessionId;
};

/**
 * Gets the current session ID or creates a new one
 */
export const getCurrentSessionId = (): string => {
  if (!currentSession || isSessionExpired()) {
    return createSession();
  }

  updateActivity();
  return currentSession.sessionId;
};

/**
 * Updates the last activity timestamp
 */
export const updateActivity = (): void => {
  if (currentSession) {
    currentSession.lastActivity = Date.now();
  }
};

/**
 * Checks if the current session has expired
 */
export const isSessionExpired = (): boolean => {
  if (!currentSession) {
    return true;
  }

  const now = Date.now();
  const timeSinceActivity = now - currentSession.lastActivity;

  return timeSinceActivity > SESSION_TIMEOUT_MS;
};

/**
 * Resets the current session
 */
export const resetSession = (): string => {
  return createSession();
};

/**
 * Gets session info for debugging
 */
export const getSessionInfo = (): SessionData | null => {
  return currentSession;
};
