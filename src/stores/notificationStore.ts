"use client";
import { create } from "zustand";
import type { FirebaseNotification } from "@/types/notification.types";

interface NotificationStore {
  notifications: FirebaseNotification[];
  unreadCount: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  notifiedIds: Set<string>;

  setNotifications: (notifications: FirebaseNotification[], hasMore: boolean) => void;
  appendNotifications: (more: FirebaseNotification[], hasMore: boolean) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  setHasMore: (v: boolean) => void;
  setIsLoadingMore: (v: boolean) => void;
  addNotifiedId: (id: string) => void;
  hasBeenNotified: (id: string) => boolean;

  // Função de loadMore registada pelo hook no providers
  _loadMore: (() => Promise<void>) | null;
  registerLoadMore: (fn: (() => Promise<void>) | null) => void;
  triggerLoadMore: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hasMore: false,
  isLoadingMore: false,
  notifiedIds: new Set(),
  _loadMore: null,

  setNotifications: (notifications, hasMore) => {
    const unreadCount = notifications.filter((n) => !n.lida).length;
    set({ notifications, unreadCount, hasMore });
  },

  appendNotifications: (more, hasMore) => {
    const { notifications } = get();
    const existingIds = new Set(notifications.map((n) => n.id));
    const fresh = more.filter((n) => !existingIds.has(n.id));
    const merged = [...notifications, ...fresh];
    set({ notifications: merged, hasMore });
  },

  markAsRead: (id) => {
    const { notifications } = get();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, lida: true } : n
    );
    set({ notifications: updated, unreadCount: updated.filter((n) => !n.lida).length });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map((n) => ({ ...n, lida: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  setHasMore: (hasMore) => set({ hasMore }),
  setIsLoadingMore: (isLoadingMore) => set({ isLoadingMore }),

  addNotifiedId: (id) => {
    const { notifiedIds } = get();
    notifiedIds.add(id);
    set({ notifiedIds: new Set(notifiedIds) });
  },

  hasBeenNotified: (id) => get().notifiedIds.has(id),

  registerLoadMore: (fn) => set({ _loadMore: fn }),

  triggerLoadMore: async () => {
    const { _loadMore, isLoadingMore, hasMore } = get();
    if (!_loadMore || isLoadingMore || !hasMore) return;
    await _loadMore();
  },
}));
