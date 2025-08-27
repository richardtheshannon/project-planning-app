'use client';

import React, { useState, useEffect } from 'react';
import { X, Info, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

interface CloseableNotificationProps {
  id: string;
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  className?: string;
  onClose?: (id: string) => void;
  isEnabled: boolean;
  closedNotifications?: string[];
}

export function CloseableNotification({
  id,
  title,
  message,
  type = 'info',
  className = '',
  onClose,
  isEnabled,
  closedNotifications = []
}: CloseableNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if this notification should be visible
    const shouldShow = isEnabled && !closedNotifications.includes(id);
    setIsVisible(shouldShow);
  }, [isEnabled, closedNotifications, id]);

  const handleClose = async () => {
    setIsVisible(false);
    
    // Save closed state to database
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

  // Icon mapping based on type
  const IconComponent = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertCircle
  }[type];

  // Theme-aware styles using Tailwind's dark mode classes
  const typeStyles = {
    info: `
      bg-blue-50/95 dark:bg-blue-950/20
      border border-blue-200/80 dark:border-blue-800/40
      text-blue-900 dark:text-blue-100
    `,
    warning: `
      bg-amber-50/95 dark:bg-amber-950/20
      border border-amber-200/80 dark:border-amber-800/40
      text-amber-900 dark:text-amber-100
    `,
    success: `
      bg-emerald-50/95 dark:bg-emerald-950/20
      border border-emerald-200/80 dark:border-emerald-800/40
      text-emerald-900 dark:text-emerald-100
    `,
    error: `
      bg-red-50/95 dark:bg-red-950/20
      border border-red-200/80 dark:border-red-800/40
      text-red-900 dark:text-red-100
    `
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 p-4 mt-2 mb-4 
        rounded-lg shadow-sm backdrop-blur-sm
        transition-all duration-200
        ${typeStyles[type].replace(/\s+/g, ' ').trim()}
        ${className}
      `}
      role="alert"
    >
      <IconComponent className="h-5 w-5 flex-shrink-0 mt-0.5 opacity-75" />
      
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold mb-1">{title}</h4>
        )}
        <p className="text-sm opacity-90">{message}</p>
      </div>
      
      <button
        onClick={handleClose}
        className="
          flex-shrink-0 p-1.5 rounded-md
          transition-all duration-200
          hover:bg-black/10 dark:hover:bg-white/10
          group
        "
        aria-label="Close notification"
      >
        <X className="
          h-4 w-4 
          opacity-50 group-hover:opacity-100
          transition-opacity duration-200
        " />
      </button>
    </div>
  );
}