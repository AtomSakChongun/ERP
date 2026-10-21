"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { Icon } from "@/components/ui/icon";

type NotifyFn = (message: string) => void;

const NotificationsContext = createContext<NotifyFn | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const timer = useRef<number | undefined>(undefined);

  const notify = useCallback<NotifyFn>((text) => {
    window.clearTimeout(timer.current);
    setMessage(text);
    timer.current = window.setTimeout(() => setMessage(""), 3200);
  }, []);

  return (
    <NotificationsContext value={notify}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {message && (
          <div className="toast">
            <span aria-hidden="true"><Icon name="check" size={17} /></span>
            {message}
          </div>
        )}
      </div>
    </NotificationsContext>
  );
}

export function useNotifications() {
  const notify = useContext(NotificationsContext);
  if (!notify) throw new Error("useNotifications must be used within <NotificationsProvider>");
  return { notify };
}
