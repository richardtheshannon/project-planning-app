'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CloseableNotificationProps {
  id: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
  onClose?: (id: string) => void;
  isEnabled: boolean;
  closedNotifications?: string[];
  position?: 'below' | 'inside'; // New prop for positioning
}

export function CloseableNotification({
  id,
  message,
  type = 'info',
  className = '',
  onClose,
  isEnabled,
  closedNotifications = [],
  position = 'below'
}: CloseableNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const shouldShow = isEnabled && !closedNotifications.includes(id);
    setIsVisible(shouldShow);
  }, [isEnabled, closedNotifications, id]);

  const handleClose = async () => {
    setIsVisible(false);
    
    try {
      await fetch('/api/users/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          closedNotification: id
        })
      });
    } catch (error) {
      console.error('Failed to save notification preference:', error);
    }
    
    if (onClose) {
      onClose(id);
    }
  };

  if (!isVisible) return null;

  // Compact theme-aware styles
  const typeStyles = {
    info: `
      bg-blue-50/80 dark:bg-blue-950/20
      border-l-2 border-blue-400 dark:border-blue-600
      text-blue-800 dark:text-blue-200
    `,
    warning: `
      bg-amber-50/80 dark:bg-amber-950/20
      border-l-2 border-amber-400 dark:border-amber-600
      text-amber-800 dark:text-amber-200
    `,
    success: `
      bg-emerald-50/80 dark:bg-emerald-950/20
      border-l-2 border-emerald-400 dark:border-emerald-600
      text-emerald-800 dark:text-emerald-200
    `,
    error: `
      bg-red-50/80 dark:bg-red-950/20
      border-l-2 border-red-400 dark:border-red-600
      text-red-800 dark:text-red-200
    `
  };

  // Position-specific styles
  const positionStyles = {
    below: 'mt-2 rounded-md',
    inside: 'rounded-b-md border-t dark:border-gray-700'
  };

  return (
    <div
      className={`
        relative pl-3 pr-7 py-2
        text-xs leading-relaxed
        transition-all duration-200
        ${typeStyles[type]}
        ${positionStyles[position]}
        ${className}
      `}
      role="alert"
    >
      <p className="m-0">{message}</p>
      
      <button
        onClick={handleClose}
        className="
          absolute top-1.5 right-1.5
          p-0.5 rounded
          transition-all duration-200
          hover:bg-black/10 dark:hover:bg-white/10
          group
        "
        aria-label="Close notification"
      >
        <X className="
          h-3 w-3 
          opacity-40 group-hover:opacity-70
          transition-opacity duration-200
        " />
      </button>
    </div>
  );
}