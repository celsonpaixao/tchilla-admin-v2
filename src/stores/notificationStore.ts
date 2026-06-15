"use client";
import { create } from "zustand";
import type { FirebaseNotification } from "@/types/notification.types";

interface NotificationStore {
  notifications: FirebaseNotification[];
  unreadCount: number;
  notifiedIds: Set<string>; // evita duplicatas entre renders
  setNotifications: (notifications: FirebaseNotification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotifiedId: (id: string) => void;
  hasBeenNotified: (id: string) => boolean;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  notifiedIds: new Set(),

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.data.lida).length;
    set({ notifications, unreadCount });
  },

  markAsRead: (id) => {
    const { notifications } = get();
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, lida: true } } : n
    );
    const unreadCount = updated.filter((n) => !n.data.lida).length;
    set({ notifications: updated, unreadCount });
  },

  markAllAsRead: () => {
    const { notifications } = get();
    const updated = notifications.map((n) => ({
      ...n,
      data: { ...n.data, lida: true },
    }));
    set({ notifications: updated, unreadCount: 0 });
  },

  addNotifiedId: (id) => {
    const { notifiedIds } = get();
    notifiedIds.add(id);
    set({ notifiedIds: new Set(notifiedIds) });
  },

  hasBeenNotified: (id) => get().notifiedIds.has(id),
}));
