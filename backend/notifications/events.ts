import { NotificationType } from "./types";

interface NotificationEvent {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

const listeners = new Map<string, Set<(event: NotificationEvent) => void>>();

export function subscribe(userId: string, callback: (event: NotificationEvent) => void): () => void {
  if (!listeners.has(userId)) {
    listeners.set(userId, new Set());
  }
  listeners.get(userId)!.add(callback);

  return () => {
    const userListeners = listeners.get(userId);
    if (userListeners) {
      userListeners.delete(callback);
      if (userListeners.size === 0) {
        listeners.delete(userId);
      }
    }
  };
}

export function emit(event: NotificationEvent): void {
  const userListeners = listeners.get(event.userId);
  if (userListeners) {
    userListeners.forEach(callback => callback(event));
  }
}
