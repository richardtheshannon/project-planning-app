'use client';

import React from 'react';
import { CloseableNotification } from './closeable-notification';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  notification?: {
    id: string;
    message: string;
    type?: 'info' | 'warning' | 'success' | 'error';
  };
  notificationSettings?: {
    isEnabled: boolean;
    closedNotifications: string[];
  };
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  subtitle,
  description,
  trend,
  notification,
  notificationSettings,
  className = '',
  onClick
}: MetricCardProps) {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-sm 
        border border-gray-200 dark:border-gray-700
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Main Card Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </h3>
          {trend && (
            <span className={`
              text-xs font-medium px-2 py-0.5 rounded-full
              ${trend.isPositive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }
            `}>
              {trend.value}
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Integrated Notification - Inside Card */}
      {notification && notificationSettings && (
        <CloseableNotification
          id={notification.id}
          message={notification.message}
          type={notification.type}
          isEnabled={notificationSettings.isEnabled}
          closedNotifications={notificationSettings.closedNotifications}
          position="inside"
        />
      )}
    </div>
  );
}