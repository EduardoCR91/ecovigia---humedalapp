import React, { createContext, useContext, useEffect, useState } from 'react';

interface NotificationContextValue {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  requestPermission: () => Promise<NotificationPermission | 'default'>;
  notify: (title: string, options?: NotificationOptions) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported || !('Notification' in window) || Notification.permission === 'granted') {
      setPermission(Notification.permission);
      return Notification.permission;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (!isSupported || Notification.permission !== 'granted') return;
    try {
      new Notification(title, options);
    } catch {
      // ignore
    }
  };

  return (
    <NotificationContext.Provider value={{ isSupported, permission, requestPermission, notify }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications debe usarse dentro de NotificationProvider');
  }
  return ctx;
};

